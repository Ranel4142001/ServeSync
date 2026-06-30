import prismaClient from "@shared/infrastructure/PrismaClient";
import { IUserRepository } from "../domain/IUserRepository";
import { User } from "../domain/User.entity";
import { Role } from "../domain/Role.enum";

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: typeof prismaClient) {}

  private toEntity(raw: any): User {
    return User.create(
      {
        email: raw.email,
        passwordHash: raw.passwordHash,
        firstName: raw.firstName,
        lastName: raw.lastName,
        role: raw.role as Role,
        isActive: raw.isActive,
        organizationId: raw.organizationId, // Now number
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id, // Now number
    );
  }

  async findById(id: number): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByOrganizationId(organizationId: number): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ where: { organizationId } });
    return rows.map((row) => this.toEntity(row));
  }

  async save(user: User): Promise<User> {
    const data = {
      email: user.email,
      passwordHash: user.passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      organizationId: user.organizationId,
      updatedAt: new Date(),
    };

    // If user.id is 0, Prisma treats it as a 'create' operation
    const raw = await this.prisma.user.upsert({
      where: { id: user.id },
      update: data,
      create: { ...data, createdAt: new Date() },
    });

    return this.toEntity(raw);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
