import { User } from './User.entity';

// This interface is a CONTRACT — it defines what operations
// are possible on users, without saying HOW they are done.
// The "I" prefix stands for Interface (common convention).
export interface IUserRepository {

  // Find a single user by their unique ID
  findById(id: string): Promise<User | null>;

  // Find a user by email — used during login
  findByEmail(email: string): Promise<User | null>;

  // Find all users belonging to one organization
  findByOrganizationId(organizationId: string): Promise<User[]>;

  // Save a new user OR update an existing one
  // One method handles both — if the user has an ID it updates,
  // if not it creates. This is called the "upsert" pattern.
  save(user: User): Promise<User>;

  // Permanently delete a user by ID
  delete(id: string): Promise<void>;

  // Check if an email is already taken — used during registration
  // to give a better error before even trying to create the user
  existsByEmail(email: string): Promise<boolean>;
}