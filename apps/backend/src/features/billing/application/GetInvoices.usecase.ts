import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Invoice } from "../domain/Invoice.entity";
import { Role } from "../../auth/domain/Role.enum";
import { IInvoiceRepository } from "../domain/IInvoiceRepository";
import { decodeId } from "@shared/utils/idGenerators";

export interface GetInvoicesInput {
  organizationId: string; // e.g., "ORG-0001"
  role: Role;
  unpaidOnly?: boolean;
}

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
    // 1 — Decode the organization ID
    const numericOrgId = decodeId(input.organizationId);

    // 2 — Security check
    if (input.role !== Role.ADMIN) {
      return Result.fail("Only admins can view billing information");
    }

    // 3 — Fetch data using numeric ID
    let invoices: Invoice[];

    if (input.unpaidOnly) {
      invoices = await this.invoiceRepository.findUnpaidByOrganizationId(numericOrgId);
    } else {
      invoices = await this.invoiceRepository.findByOrganizationId(numericOrgId);
    }

    // 4 — Calculate totals
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