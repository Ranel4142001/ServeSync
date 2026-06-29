import { User } from './User.entity';

// Contract for user persistence — defines what operations are possible, not how they are done
export interface IUserRepository {

  // Find a user by ID
  findById(id: string): Promise<User | null>;

  // Find a user by email — used during login
  findByEmail(email: string): Promise<User | null>;

  // Find all users in an organization
  findByOrganizationId(organizationId: string): Promise<User[]>;

  // Save a new user or update an existing one (upsert)
  save(user: User): Promise<User>;

  // Permanently delete a user by ID
  delete(id: string): Promise<void>;

  // Check if an email is already taken — used during registration to fail early
  existsByEmail(email: string): Promise<boolean>;
}