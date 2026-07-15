import { ExtendedPrismaClient } from "@shared/infrastructure/PrismaClient";
import { IInvoiceRepository } from "../../domain/IInvoiceRepository";
import { Invoice } from "../../domain/Invoice.entity";

export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: ExtendedPrismaClient) {}

  // Maps a raw Prisma row to an Invoice entity
  private toEntity(raw: any): Invoice {
    return Invoice.create(
      {
        number: raw.number,
        amount: raw.amount,
        currency: raw.currency,
        description: raw.description,
        paidAt: raw.paidAt,
        organizationId: raw.organizationId, // Maps as a number
        createdAt: raw.createdAt,
      },
      raw.id, // raw.id is an integer
    );
  }

  async findById(id: string): Promise<Invoice | null> {
    const raw = await this.prisma.invoice.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByOrganizationId(organizationId: string): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findUnpaidByOrganizationId(organizationId: string): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        paidAt: null,
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const data = {
      number: invoice.number,
      amount: invoice.amount,
      currency: invoice.currency,
      description: invoice.description,
      paidAt: invoice.paidAt,
      organizationId: invoice.organizationId,
    };

    const raw = await this.prisma.invoice.upsert({
      where: { id: invoice.id },
      update: data,
      create: { id: invoice.id, ...data, createdAt: new Date() },
    });
    return this.toEntity(raw);
  }
}
