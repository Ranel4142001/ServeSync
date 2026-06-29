import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Invoice }   from '../domain/Invoice.entity';
import { Role }      from '../../auth/domain/Role.enum';
import { IInvoiceRepository } from '../domain/IInvoiceRepository';

// ── Input ────────────────────────────────────────────────
export interface GetInvoicesInput {
  organizationId: string; // from JWT token
  role:           Role;   // from JWT token
  unpaidOnly?:    boolean; // filter to show only unpaid invoices
}

// ── Output ───────────────────────────────────────────────
export interface GetInvoicesOutput {
  invoices:     ReturnType<Invoice['toJSON']>[];
  totalUnpaid:  number; // total amount owed across all unpaid invoices
  totalPaid:    number; // total amount paid
}

// ── Use-case ─────────────────────────────────────────────
export class GetInvoicesUseCase
  implements UseCase<Result<GetInvoicesOutput>, GetInvoicesInput>
{
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
  ) {}

  async execute(input: GetInvoicesInput): Promise<Result<GetInvoicesOutput>> {

    // Step 1 — Only admins can view billing
    // Agents and clients have no reason to see invoices
    if (input.role !== Role.ADMIN) {
      return Result.fail('Only admins can view billing information');
    }

    // Step 2 — Get invoices based on filter
    let invoices: Invoice[];

    if (input.unpaidOnly) {
      // Get only unpaid invoices
      invoices = await this.invoiceRepository.findUnpaidByOrganizationId(
        input.organizationId
      );
    } else {
      // Get all invoices — full billing history
      invoices = await this.invoiceRepository.findByOrganizationId(
        input.organizationId
      );
    }

    // Step 3 — Calculate totals
    // This is business logic — it belongs in the use-case
    // not in the route handler or the repository
    const totalUnpaid = invoices
      .filter(inv => !inv.isPaid)  // only unpaid ones
      .reduce((sum, inv) => sum + inv.amount, 0); // add up amounts

    const totalPaid = invoices
      .filter(inv => inv.isPaid)   // only paid ones
      .reduce((sum, inv) => sum + inv.amount, 0);

    return Result.ok({
      invoices:    invoices.map(inv => inv.toJSON()),
      totalUnpaid,
      totalPaid,
    });
  }
}