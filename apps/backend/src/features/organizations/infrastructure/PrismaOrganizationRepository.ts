import { PrismaClient } from "@prisma/client";
import { IOrganizationRepository } from "../domain/IOrganizationRepository";
import { Organization } from "../domain/Organization.entity";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Maps a raw Prisma row to an Organization entity — only place that knows Prisma's organization shape
  private toEntity(raw: any): Organization {
    return Organization.create(
      {
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id,
    );
  }

  async findById(id: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({ where: { slug } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async save(organization: Organization): Promise<Organization> {
    // Upsert — create if new, update if exists
    const raw = await this.prisma.organization.upsert({
      where: { id: organization.id || "" },
      update: {
        name: organization.name,
        slug: organization.slug,
        updatedAt: new Date(),
      },
      create: {
        name: organization.name,
        slug: organization.slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return this.toEntity(raw);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.organization.count({ where: { slug } });
    return count > 0;
  }
}
