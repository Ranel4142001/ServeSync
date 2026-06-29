import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Invoice } from "../domain/Invoice.entity";
import { Role } from "../../auth/domain/Role.enum";
import { IInvoiceRepository } from "../domain/IInvoiceRepository";

// Input — organizationId and role from JWT; optional filter for unpaid only
export interface GetInvoicesInput {
  organizationId: string;
  role: Role;
  unpaidOnly?: boolean;
}

// Output — invoice list with total paid and unpaid amounts
export interface GetInvoicesOutput {
  invoices: ReturnType<Invoice["toJSON"]>[];
  totalUnpaid: number;
  totalPaid: number;
}

export class GetInvoicesUseCase implements UseCase<
  Result<GetInvoicesOutput>,
  GetInvoicesInput
> {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(input: GetInvoicesInput): Promise<Result<GetInvoicesOutput>> {
    // 1 — Only admins can view billing information
    if (input.role !== Role.ADMIN) {
      return Result.fail("Only admins can view billing information");
    }

    // 2 — Fetch unpaid only or full billing history based on filter
    let invoices: Invoice[];

    if (input.unpaidOnly) {
      invoices = await this.invoiceRepository.findUnpaidByOrganizationId(
        input.organizationId,
      );
    } else {
      invoices = await this.invoiceRepository.findByOrganizationId(
        input.organizationId,
      );
    }

    // 3 — Calculate totals across the result set
    const totalUnpaid = invoices
      .filter((inv) => !inv.isPaid)
      .reduce((sum, inv) => sum + inv.amount, 0);

    const totalPaid = invoices
      .filter((inv) => inv.isPaid)
      .reduce((sum, inv) => sum + inv.amount, 0);

    return Result.ok({
      invoices: invoices.map((inv) => inv.toJSON()),
      totalUnpaid,
      totalPaid,
    });
  }
}
