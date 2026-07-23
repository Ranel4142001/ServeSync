import datetime
from src.features.billing.domain.invoice_repository import IInvoiceRepository
from src.shared.infrastructure.models import Invoice, UserRole
from src.shared.domain.result import Result

class MarkInvoicePaidUseCase:
    """
    UseCase to mark a pending invoice as paid.
    Only authorized for Admins.
    """
    def __init__(self, invoice_repository: IInvoiceRepository) -> None:
        self.invoice_repository = invoice_repository

    def execute(self, invoice_id: str, role: str) -> Result[Invoice]:
        if role != UserRole.ADMIN.value:
            return Result.fail("Only admins can mark invoices as paid")

        invoice = self.invoice_repository.find_by_id(invoice_id)
        if not invoice:
            return Result.fail("Invoice not found")

        if invoice.isPaid:
            return Result.fail("Invoice is already paid")

        invoice.paidAt = datetime.datetime.utcnow()
        saved = self.invoice_repository.save(invoice)
        
        return Result.ok(saved)
