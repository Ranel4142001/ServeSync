import { User } from "./User.entity";

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByOrganizationId(organizationId: number): Promise<User[]>; // Updated
  save(user: User): Promise<User>;
  delete(id: number): Promise<void>; // Updated
  existsByEmail(email: string): Promise<boolean>;
}
