import { PrismaClient }       from '@prisma/client';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';
import { Invoice }            from '../domain/Invoice.entity';

export class PrismaInvoiceRepository implements IInvoiceRepository {

  constructor(private readonly prisma: PrismaClient) {}

  // Converts a raw Prisma row into a clean Invoice entity
  // This is the ONLY place that knows how Prisma stores invoices
  private toEntity(raw: any): Invoice {
    return Invoice.create(
      {
        amount:         raw.amount,
        currency:       raw.currency,
        description:    raw.description,
        paidAt:         raw.paidAt,
        organizationId: raw.organizationId,
        createdAt:      raw.createdAt,
      },
      raw.id
    );
  }

  async findById(id: string): Promise<Invoice | null> {
    const raw = await this.prisma.invoice.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByOrganizationId(organizationId: string): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where:   { organizationId },
      orderBy: { createdAt: 'desc' }, // newest invoices first
    });
    return rows.map(row => this.toEntity(row));
  }

  async findUnpaidByOrganizationId(organizationId: string): Promise<Invoice[]> {
    const rows = await this.prisma.invoice.findMany({
      where: {
        organizationId,
        paidAt: null, // null means unpaid in our schema
      },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(row => this.toEntity(row));
  }

  async save(invoice: Invoice): Promise<Invoice> {
    const data = {
      amount:         invoice.amount,
      currency:       invoice.currency,
      description:    invoice.description,
      paidAt:         invoice.paidAt,
      organizationId: invoice.organizationId,
    };

    const raw = await this.prisma.invoice.upsert({
      where:  { id: invoice.id || '' },
      update: data,
      create: { ...data, createdAt: new Date() },
    });

    return this.toEntity(raw);
  }
}