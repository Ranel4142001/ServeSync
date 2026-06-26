import { UseCase }       from '@shared/application/UseCase';
import { Result }        from '@shared/domain/Result';
import { Organization }  from '../domain/Organization.entity';
import { IOrganizationRepository } from '../domain/IOrganizationRepository';

// ── Input ────────────────────────────────────────────────
// What the caller must provide to create an organization
export interface CreateOrganizationInput {
  name: string;   // e.g. "Acme Corp"
  slug?: string;  // optional — we auto-generate it from name if not provided
}

// ── Output ───────────────────────────────────────────────
// What we return on success
export interface CreateOrganizationOutput {
  organization: ReturnType<Organization['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class CreateOrganizationUseCase
  implements UseCase<Result<CreateOrganizationOutput>, CreateOrganizationInput>
{
  constructor(
    // Depends on the interface, not on Prisma directly
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(input: CreateOrganizationInput): Promise<Result<CreateOrganizationOutput>> {

    // Step 1 — Generate slug from name if not provided
    // e.g. if name is "Acme Corp" and no slug given → "acme-corp"
    const slug = input.slug
      ? input.slug
      : Organization.generateSlug(input.name);

    // Step 2 — Check if slug is already taken
    // Two organizations cannot have the same slug
    const slugTaken = await this.organizationRepository.existsBySlug(slug);
    if (slugTaken) {
      return Result.fail(`Slug "${slug}" is already taken. Please choose a different name.`);
    }

    // Step 3 — Create the Organization entity
    // If name or slug is invalid, it throws here before hitting the DB
    const organization = Organization.create({
      name:      input.name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Step 4 — Save to database via the repository interface
    const saved = await this.organizationRepository.save(organization);

    // Step 5 — Return success
    return Result.ok({ organization: saved.toJSON() });
  }
}