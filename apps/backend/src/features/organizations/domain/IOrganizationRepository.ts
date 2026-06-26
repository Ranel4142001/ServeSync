import { Organization } from './Organization.entity';

// The CONTRACT — defines what we can do with organizations
// No Prisma here, just pure TypeScript interfaces
export interface IOrganizationRepository {

  // Find one organization by its unique ID
  findById(id: string): Promise<Organization | null>;

  // Find one organization by its slug
  // Used to check if a slug is already taken
  findBySlug(slug: string): Promise<Organization | null>;

  // Save a new organization to the database
  save(organization: Organization): Promise<Organization>;

  // Check if a slug already exists
  // Used during creation to prevent duplicates
  existsBySlug(slug: string): Promise<boolean>;
}