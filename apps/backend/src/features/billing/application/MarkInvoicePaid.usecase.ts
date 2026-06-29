import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Invoice }  from '../domain/Invoice.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';

// ── Input ────────────────────────────────────────────────
export interface MarkInvoicePaidInput {
  invoiceId: string; // which invoice to mark as paid
  role:      Role;   // from JWT — only admins can do this
}

// ── Output ───────────────────────────────────────────────
export interface MarkInvoicePaidOutput {
  invoice: ReturnType<Invoice['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class MarkInvoicePaidUseCase
  implements UseCase<Result<MarkInvoicePaidOutput>, MarkInvoicePaidInput>
{
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(input: MarkInvoicePaidInput): Promise<Result<MarkInvoicePaidOutput>> {

    // Step 1 — Only admins can mark invoices as paid
    if (input.role !== Role.ADMIN) {
      return Result.fail('Only admins can mark invoices as paid');
    }

    // Step 2 — Find the invoice
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) {
      return Result.fail('Invoice not found');
    }

    // Step 3 — Mark as paid using the domain method
    // The Invoice entity handles the business rule:
    // "you cannot pay an already-paid invoice"
    // If it is already paid, this throws an error
    try {
      invoice.markAsPaid();
    } catch (error: unknown) {
      const message = error instanceof Error
        ? error.message
        : 'Could not mark invoice as paid';
      return Result.fail(message);
    }

    // Step 4 — Save the updated invoice
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}