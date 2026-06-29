import { Invoice } from './Invoice.entity';

// The CONTRACT for invoice data operations
// Prisma implements this — but the use-cases
// never know that. They only see this interface.
export interface IInvoiceRepository {

  // Find a single invoice by its ID
  findById(id: string): Promise<Invoice | null>;

  // Find all invoices for an organization
  // Used by admins to see all billing history
  findByOrganizationId(organizationId: string): Promise<Invoice[]>;

  // Find only unpaid invoices for an organization
  // Used to show which invoices need payment
  findUnpaidByOrganizationId(organizationId: string): Promise<Invoice[]>;

  // Save a new invoice OR update an existing one
  save(invoice: Invoice): Promise<Invoice>;
}