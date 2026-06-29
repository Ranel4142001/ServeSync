import { Organization } from './Organization.entity';

// Contract for organization persistence — no Prisma, just the shape of operations
export interface IOrganizationRepository {

  // Find an organization by ID
  findById(id: string): Promise<Organization | null>;

  // Find an organization by slug
  findBySlug(slug: string): Promise<Organization | null>;

  // Save a new organization or update an existing one
  save(organization: Organization): Promise<Organization>;

  // Check if a slug is already taken — used during creation to prevent duplicates
  existsBySlug(slug: string): Promise<boolean>;
}