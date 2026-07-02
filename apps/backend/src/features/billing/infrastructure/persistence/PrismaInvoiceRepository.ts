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

  async findById(id: number): Promise<Invoice | null> {
    const raw = await this.prisma.invoice.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByOrganizationId(organizationId: number): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async findUnpaidByOrganizationId(organizationId: number): Promise<Invoice[]> {
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
      amount:         invoice.amount,
      currency:       invoice.currency,
      description:    invoice.description,
      paidAt:         invoice.paidAt,
      organizationId: invoice.organizationId,
    };

    // If id > 0, execute database updates
    if (invoice.id && invoice.id > 0) {
      const raw = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data,
      });
      return this.toEntity(raw);
    }

    // New invoice creation — clean database write without manual loops!
    // If you have a matching `number` column in your DB schema, we pass invoice.number (or null)
    // and let our global Prisma computed extension output 'INV-2026-0000X' cleanly later.
    const raw = await this.prisma.invoice.create({
      data: {
        number:    invoice.number,
        ...data,
        createdAt: new Date(),
      },
    });
    return this.toEntity(raw);
  }
}