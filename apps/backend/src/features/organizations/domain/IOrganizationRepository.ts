import { Organization } from './Organization.entity';

export interface IOrganizationRepository {
  // Find an organization by numeric ID
  findById(id: number): Promise<Organization | null>;

  // Find an organization by slug
  findBySlug(slug: string): Promise<Organization | null>;

  // Save a new organization or update an existing one
  save(organization: Organization): Promise<Organization>;

  // Check if a slug is already taken
  existsBySlug(slug: string): Promise<boolean>;
}