import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Invoice } from "../domain/Invoice.entity";
import { Role } from "../../auth/domain/Role.enum";
import { IInvoiceRepository } from "../domain/IInvoiceRepository";

export interface MarkInvoicePaidInput {
  invoiceId: number;
  role: Role;
}

export interface MarkInvoicePaidOutput {
  invoice: ReturnType<Invoice["toJSON"]>;
}

export class MarkInvoicePaidUseCase implements UseCase<
  Result<MarkInvoicePaidOutput>,
  MarkInvoicePaidInput
> {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(
    input: MarkInvoicePaidInput,
  ): Promise<Result<MarkInvoicePaidOutput>> {
    // 1 — Authorization check
    if (input.role !== Role.ADMIN) {
      return Result.fail("Only admins can mark invoices as paid");
    }

    // 2 — Load the invoice
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) {
      return Result.fail("Invoice not found");
    }

    // 3 — Domain logic: Mark as paid
    try {
      invoice.markAsPaid();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not mark invoice as paid";
      return Result.fail(message);
    }

    // 4 — Persist updated state
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}