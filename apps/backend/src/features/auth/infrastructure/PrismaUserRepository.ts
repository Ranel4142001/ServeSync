import { PrismaClient } from '@prisma/client';
import { IUserRepository } from '../domain/IUserRepository';
import { User } from '../domain/User.entity';
import { Role } from '../domain/Role.enum';

export class PrismaUserRepository implements IUserRepository {

  // Prisma client is injected — we don't create it here
  constructor(private readonly prisma: PrismaClient) {}

  // ── Private helper ───────────────────────────────────────
  // Converts a raw Prisma database row into a clean User entity
  // This is the ONLY place in the entire codebase that knows
  // how Prisma represents a user — everything else sees User
  private toEntity(raw: any): User {
    return User.create(
      {
        email:          raw.email,
        passwordHash:   raw.passwordHash,
        firstName:      raw.firstName,
        lastName:       raw.lastName,
        role:           raw.role as Role,
        isActive:       raw.isActive,
        organizationId: raw.organizationId,
        createdAt:      raw.createdAt,
        updatedAt:      raw.updatedAt,
      },
      raw.id
    );
  }

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({ where: { email } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByOrganizationId(organizationId: string): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ where: { organizationId } });
    return rows.map(row => this.toEntity(row));
  }

  async save(user: User): Promise<User> {
    const data = {
      email:          user.email,
      passwordHash:   user.passwordHash,
      firstName:      user.firstName,
      lastName:       user.lastName,
      role:           user.role,
      isActive:       user.isActive,
      organizationId: user.organizationId,
      updatedAt:      new Date(),
    };

    // If user already has an ID — update. Otherwise — create.
    const raw = await this.prisma.user.upsert({
      where:  { id: user.id || '' },
      update: data,
      create: { ...data, createdAt: new Date() },
    });

    return this.toEntity(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}