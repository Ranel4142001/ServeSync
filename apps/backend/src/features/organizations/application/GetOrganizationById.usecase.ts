import { UseCase } from '@shared/application/UseCase';
import { Result } from '@shared/domain/Result';
import { Organization } from '../domain/Organization.entity';
import { IOrganizationRepository } from '../domain/IOrganizationRepository';
import { decodeId } from '@shared/utils/idGenerators';

export interface GetOrganizationByIdInput {
  orgId: string; // e.g., "ORG-0001" coming from the frontend route parameters
}

export interface GetOrganizationByIdOutput {
  organization: ReturnType<Organization['toJSON']>;
}

export class GetOrganizationByIdUseCase
  implements UseCase<Result<GetOrganizationByIdOutput>, GetOrganizationByIdInput>
{
  constructor(
    private readonly organizationRepository: IOrganizationRepository,
  ) {}

  async execute(input: GetOrganizationByIdInput): Promise<Result<GetOrganizationByIdOutput>> {
    // 1 — Decode the incoming string handle into an operational number
    const numericOrgId = decodeId(input.orgId);

    // 2 — Query the database using the high-performance index
    const organization = await this.organizationRepository.findById(numericOrgId);
    if (!organization) {
      return Result.fail('Organization not found');
    }

    // 3 — Return the formatted payload safely
    return Result.ok({
      organization: organization.toJSON(),
    });
  }
}