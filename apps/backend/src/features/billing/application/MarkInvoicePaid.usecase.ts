import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Invoice } from "../domain/Invoice.entity";
import { Role } from "../../auth/domain/Role.enum";
import { IInvoiceRepository } from "../domain/IInvoiceRepository";
import { decodeId } from "@shared/utils/idGenerators";

export interface MarkInvoicePaidInput {
  invoiceId: string; // e.g., "INV-0042"
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
    // 1 — Decode the invoice ID
    const numericInvoiceId = decodeId(input.invoiceId);

    // 2 — Authorization check
    if (input.role !== Role.ADMIN) {
      return Result.fail("Only admins can mark invoices as paid");
    }

    // 3 — Load the invoice
    const invoice = await this.invoiceRepository.findById(numericInvoiceId);
    if (!invoice) {
      return Result.fail("Invoice not found");
    }

    // 4 — Domain logic: Mark as paid
    try {
      invoice.markAsPaid();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not mark invoice as paid";
      return Result.fail(message);
    }

    // 5 — Persist updated state
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}