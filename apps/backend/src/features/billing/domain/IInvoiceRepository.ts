import { Invoice } from './Invoice.entity';

// Contract for invoice persistence — use-cases depend on this, not on Prisma directly
export interface IInvoiceRepository {

  // Find a single invoice by ID
  findById(id: number): Promise<Invoice | null>;

  // Find all invoices for an organization
  findByOrganizationId(organizationId: number): Promise<Invoice[]>;

  // Find only unpaid invoices for an organization
  findUnpaidByOrganizationId(organizationId: number): Promise<Invoice[]>;

  // Save a new invoice or update an existing one
  save(invoice: Invoice): Promise<Invoice>;
}