import { UseCase }       from '@shared/application/UseCase';
import { Result }        from '@shared/domain/Result';
import { Organization }  from '../domain/Organization.entity';
import { IOrganizationRepository } from '../domain/IOrganizationRepository';

// Input — name is required; slug is auto-generated from name if not provided
export interface CreateOrganizationInput {
  name:  string;
  slug?: string;
}

// Output — the newly created organization
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

    // 3 — Create the Organization entity; throws if name or slug is invalid
    const organization = Organization.create({
      name:      input.name,
      slug,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // 4 — Persist and return the saved organization
    const saved = await this.organizationRepository.save(organization);

    return Result.ok({ organization: saved.toJSON() });
  }
}