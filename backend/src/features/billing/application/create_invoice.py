import datetime
import random
from src.features.billing.domain.invoice_repository import IInvoiceRepository
from src.features.billing.presentation.schemas import CreateInvoiceRequest
from src.shared.infrastructure.models import Invoice
from src.shared.domain.result import Result

class CreateInvoiceUseCase:
    """
    UseCase to generate a new support invoice.
    Auto-assigns invoice number and format structure.
    """
    def __init__(self, invoice_repository: IInvoiceRepository) -> None:
        self.invoice_repository = invoice_repository

    def execute(self, req: CreateInvoiceRequest, organization_id: str) -> Result[Invoice]:
        # Generate custom invoice number format e.g. "INV-2026-89472"
        year = datetime.datetime.utcnow().year
        seq = random.randint(10000, 99999)
        invoice_number = f"INV-{year}-{seq}"

        new_invoice = Invoice(
            number=invoice_number,
            amount=req.amount,
            currency=req.currency.upper(),
            description=req.description,
            paidAt=None,
            organizationId=organization_id
        )

        saved = self.invoice_repository.save(new_invoice)
        return Result.ok(saved)
