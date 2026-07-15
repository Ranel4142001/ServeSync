import { ExtendedPrismaClient } from "@shared/infrastructure/PrismaClient";
import { IOrganizationRepository } from "../../domain/IOrganizationRepository";
import { Organization } from "../../domain/Organization.entity";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: ExtendedPrismaClient) {}

  // Maps a raw Prisma row to an Organization entity
  private toEntity(raw: any): Organization {
    return Organization.create(
      {
        code: raw.publicId ?? raw.code ?? null,
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id, // raw.id is now a number
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
    const data = {
      code:      organization.code ?? null, 
      name:      organization.name,
      slug:      organization.slug,
      updatedAt: new Date(),
    };

    const raw = await this.prisma.organization.upsert({
      where: { id: organization.id },
      update: data,
      create: {
        id: organization.id,
        ...data,
        createdAt: new Date(),
      },
    });
    return this.toEntity(raw);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.organization.count({ where: { slug } });
    return count > 0;
  }
}