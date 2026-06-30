import { UseCase }       from '@shared/application/UseCase';
import { Result }        from '@shared/domain/Result';
import { Organization }  from '../domain/Organization.entity';
import { IOrganizationRepository } from '../domain/IOrganizationRepository';

// Input uses raw user string values from the API request body
export interface CreateOrganizationInput {
  name:  string;
  slug?: string;
}

export interface CreateOrganizationOutput {
  organization: ReturnType<Organization['toJSON']>;
}

export class CreateOrganizationUseCase
  implements UseCase<Result<CreateOrganizationOutput>, CreateOrganizationInput>
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(input: CreateOrganizationInput): Promise<Result<CreateOrganizationOutput>> {

    // 1 — Generate slug from name if not provided e.g. "Acme Corp" → "acme-corp"
    const slug = input.slug
      ? input.slug
      : Organization.generateSlug(input.name);

    // 2 — Reject if slug is already taken
    const slugTaken = await this.organizationRepository.existsBySlug(slug);
    if (slugTaken) {
      return Result.fail(`Slug "${slug}" is already taken. Please choose a different name.`);
    }

    // 3 — Create the Organization entity (ID defaults to 0 and auto-increments on save)
    const organization = Organization.create({
      code:      null, // Calculated dynamically as a computed property in Prisma via publicId
      name:      input.name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4 — Persist and return the saved organization with its new internal numeric ID
    const saved = await this.organizationRepository.save(organization);

    return Result.ok({ organization: saved.toJSON() });
  }
}