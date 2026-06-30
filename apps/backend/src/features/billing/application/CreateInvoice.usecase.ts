import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Invoice }   from '../domain/Invoice.entity';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';
import { decodeId } from '@shared/utils/idGenerators';

export interface CreateInvoiceInput {
  amount:         number;
  currency:       string;
  description?:   string;
  organizationId: string; // Kept as string interface bound to public client payload
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
    // 1 — Safe conversion of the public string identifier to internal integer
    const numericOrgId = decodeId(input.organizationId);

    // 2 — Create the Invoice domain entity with standard numeric configurations
    const invoice = Invoice.create({
      number:         null,
      amount:         input.amount,
      currency:       input.currency.toUpperCase(),
      description:    input.description ?? null,
      paidAt:         null,
      organizationId: numericOrgId,
      createdAt:      new Date(),
    });

    // 3 — Persist domain model via infrastructure repository
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}