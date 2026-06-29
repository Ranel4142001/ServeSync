import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Invoice }   from '../domain/Invoice.entity';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';

// Input — organization, amount, and currency to bill
export interface CreateInvoiceInput {
  amount:         number;
  currency:       string;
  description?:   string;
  organizationId: string;
}

// Output — the newly created invoice
export interface CreateInvoiceOutput {
  invoice: ReturnType<Invoice['toJSON']>;
}

export class CreateInvoiceUseCase
  implements UseCase<Result<CreateInvoiceOutput>, CreateInvoiceInput>
{
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(input: CreateInvoiceInput): Promise<Result<CreateInvoiceOutput>> {

    // 1 — Create the Invoice entity; throws if amount or currency is invalid
    const invoice = Invoice.create({
      amount:         input.amount,
      currency:       input.currency.toUpperCase(),
      description:    input.description ?? null,
      paidAt:         null,
      organizationId: input.organizationId,
      createdAt:      new Date(),
    });

    // 2 — Persist and return the saved invoice
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}