import { PrismaClient } from "@prisma/client";
import { IOrganizationRepository } from "../domain/IOrganizationRepository";
import { Organization } from "../domain/Organization.entity";

export class PrismaOrganizationRepository implements IOrganizationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // Maps a raw Prisma row to an Organization entity
  private toEntity(raw: any): Organization {
    return Organization.create(
      {
        code: raw.code,
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      raw.id, // raw.id is now a number
    );
  }

  // Contract requires number now
  async findById(id: number): Promise<Organization | null> {
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
      name:      organization.name,
      slug:      organization.slug,
      updatedAt: new Date(),
    };

    // If id > 0, it already exists, so we execute an update
    if (organization.id && organization.id > 0) {
      const raw = await this.prisma.organization.update({
        where: { id: organization.id },
        data,
      });
      return this.toEntity(raw);
    }
    
    // For creation, we let the DB handle autoincrement natively. 
    // If you still have a 'code' string column in your DB schema, you can pass null or an empty string,
    // since our Prisma extension computes the true 'publicId' handle (e.g. ORG-0012) dynamically!
    const raw = await this.prisma.organization.create({
      data: {
        code:      organization.code ?? null, 
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