from typing import List, Tuple
from src.features.billing.domain.invoice_repository import IInvoiceRepository
from src.shared.infrastructure.models import Invoice, UserRole
from src.shared.domain.result import Result

class GetInvoicesUseCase:
    """
    UseCase to list invoices for an organization.
    Computes totals for paid and unpaid scopes.
    """
    def __init__(self, invoice_repository: IInvoiceRepository) -> None:
        self.invoice_repository = invoice_repository

    def execute(
        self, 
        organization_id: str, 
        role: str, 
        unpaid_only: bool = False
    ) -> Result[Tuple[List[Invoice], float, float]]:
        # Security check: Admins and Clients are authorized
        if role not in [UserRole.ADMIN.value, UserRole.CLIENT.value]:
            return Result.fail("Unauthorized to view billing information")

        if unpaid_only:
            invoices = self.invoice_repository.find_unpaid_by_organization_id(organization_id)
        else:
            invoices = self.invoice_repository.find_by_organization_id(organization_id)

        # Calculate totals
        total_unpaid = sum(inv.amount for inv in invoices if not inv.isPaid)
        total_paid = sum(inv.amount for inv in invoices if inv.isPaid)

        return Result.ok((invoices, total_unpaid, total_paid))
