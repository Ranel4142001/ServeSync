import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Invoice }   from '../domain/Invoice.entity';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';

export interface CreateInvoiceInput {
  amount:         number;
  currency:       string;
  description?:   string;
  organizationId: string;
}

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
    // 1 — Create the Invoice domain entity
    const invoice = Invoice.create({
      number:         null,
      amount:         input.amount,
      currency:       input.currency.toUpperCase(),
      description:    input.description ?? null,
      paidAt:         null,
      organizationId: input.organizationId,
      createdAt:      new Date(),
    });

    // 2 — Persist domain model via infrastructure repository
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}