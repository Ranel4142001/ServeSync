import { Invoice } from './Invoice.entity';

// Contract for invoice persistence — use-cases depend on this, not on Prisma directly
export interface IInvoiceRepository {

  // Find a single invoice by ID
  findById(id: string): Promise<Invoice | null>;

  // Find all invoices for an organization
  findByOrganizationId(organizationId: string): Promise<Invoice[]>;

  // Find only unpaid invoices for an organization
  findUnpaidByOrganizationId(organizationId: string): Promise<Invoice[]>;

  // Save a new invoice or update an existing one
  save(invoice: Invoice): Promise<Invoice>;
}