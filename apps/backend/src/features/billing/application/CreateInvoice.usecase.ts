import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Invoice }   from '../domain/Invoice.entity';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';

// ── Input ────────────────────────────────────────────────
export interface CreateInvoiceInput {
  amount:         number;  // e.g. 29.00
  currency:       string;  // e.g. "USD"
  description?:   string;  // optional description
  organizationId: string;  // which org to bill
}

// ── Output ───────────────────────────────────────────────
export interface CreateInvoiceOutput {
  invoice: ReturnType<Invoice['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class CreateInvoiceUseCase
  implements UseCase<Result<CreateInvoiceOutput>, CreateInvoiceInput>
{
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(input: CreateInvoiceInput): Promise<Result<CreateInvoiceOutput>> {

    // Step 1 — Create the Invoice entity
    // If amount is zero or currency is wrong it throws here
    const invoice = Invoice.create({
      amount:         input.amount,
      currency:       input.currency.toUpperCase(), // always store as uppercase
      description:    input.description ?? null,
      paidAt:         null,  // always starts as unpaid
      organizationId: input.organizationId,
      createdAt:      new Date(),
    });

    // Step 2 — Save to database
    const saved = await this.invoiceRepository.save(invoice);

    // Step 3 — Return the created invoice
    return Result.ok({ invoice: saved.toJSON() });
  }
}