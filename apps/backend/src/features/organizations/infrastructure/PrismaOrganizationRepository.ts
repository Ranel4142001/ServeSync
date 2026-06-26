import { PrismaClient }  from '@prisma/client';
import { IOrganizationRepository } from '../domain/IOrganizationRepository';
import { Organization }  from '../domain/Organization.entity';

export class PrismaOrganizationRepository implements IOrganizationRepository {

  // Prisma is injected — this class never creates it
  constructor(private readonly prisma: PrismaClient) {}

  // ── Private helper ───────────────────────────────────────
  // Converts a raw Prisma row into a clean Organization entity
  // This is the ONLY place that knows how Prisma stores organizations
  private toEntity(raw: any): Organization {
    return Organization.create(
      {
        name:      raw.name,
        slug:      raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id
    );
  }

  async findById(id: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({
      where: { id }
    });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findBySlug(slug: string): Promise<Organization | null> {
    const raw = await this.prisma.organization.findUnique({
      where: { slug }
    });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async save(organization: Organization): Promise<Organization> {
    // upsert — creates if new, updates if exists
    const raw = await this.prisma.organization.upsert({
      where:  { id: organization.id || '' },
      update: {
        name:      organization.name,
        slug:      organization.slug,
        updatedAt: new Date(),
      },
      create: {
        name:      organization.name,
        slug:      organization.slug,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return this.toEntity(raw);
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await this.prisma.organization.count({
      where: { slug }
    });
    return count > 0;
  }
}