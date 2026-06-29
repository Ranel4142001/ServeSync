import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Invoice } from "../domain/Invoice.entity";
import { Role } from "../../auth/domain/Role.enum";
import { IInvoiceRepository } from "../domain/IInvoiceRepository";

// Input — invoiceId to mark paid; role from JWT to guard admin-only access
export interface MarkInvoicePaidInput {
  invoiceId: string;
  role: Role;
}

// Output — the updated invoice
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
    // 1 — Only admins can mark invoices as paid
    if (input.role !== Role.ADMIN) {
      return Result.fail("Only admins can mark invoices as paid");
    }

    // 2 — Load the invoice
    const invoice = await this.invoiceRepository.findById(input.invoiceId);
    if (!invoice) {
      return Result.fail("Invoice not found");
    }

    // 3 — Mark as paid; throws if already paid
    try {
      invoice.markAsPaid();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not mark invoice as paid";
      return Result.fail(message);
    }

    // 4 — Persist and return the updated invoice
    const saved = await this.invoiceRepository.save(invoice);

    return Result.ok({ invoice: saved.toJSON() });
  }
}
