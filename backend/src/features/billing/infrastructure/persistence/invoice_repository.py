from typing import List, Optional
from sqlalchemy.orm import Session
from src.features.billing.domain.invoice_repository import IInvoiceRepository
from src.shared.infrastructure.models import Invoice

class SqlAlchemyInvoiceRepository(IInvoiceRepository):
    """
    SQLAlchemy implementation of the Invoice Repository.
    """
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, id: str) -> Optional[Invoice]:
        return self.db.query(Invoice).filter(Invoice.id == id).first()

    def find_by_organization_id(self, organization_id: str) -> List[Invoice]:
        return self.db.query(Invoice).filter(
            Invoice.organizationId == organization_id
        ).order_by(Invoice.createdAt.desc()).all()

    def find_unpaid_by_organization_id(self, organization_id: str) -> List[Invoice]:
        return self.db.query(Invoice).filter(
            Invoice.organizationId == organization_id,
            Invoice.paidAt.is_(None)
        ).order_by(Invoice.createdAt.desc()).all()

    def save(self, invoice: Invoice) -> Invoice:
        merged = self.db.merge(invoice)
        self.db.commit()
        self.db.refresh(merged)
        return merged
