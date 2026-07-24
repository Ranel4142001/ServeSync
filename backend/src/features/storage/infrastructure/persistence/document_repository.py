from typing import List, Optional
from sqlalchemy.orm import Session
from src.features.storage.domain.document_repository import IDocumentRepository
from src.shared.infrastructure.models import Document

class SqlAlchemyDocumentRepository(IDocumentRepository):
    """
    SQLAlchemy implementation of the Document Repository.
    """
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, id: str) -> Optional[Document]:
        return self.db.query(Document).filter(Document.id == id).first()

    def find_by_ticket_id(self, ticket_id: str) -> List[Document]:
        return self.db.query(Document).filter(
            Document.ticketId == ticket_id
        ).order_by(Document.createdAt.desc()).all()

    def save(self, document: Document) -> Document:
        self.db.merge(document)
        self.db.commit()
        return document

    def delete(self, id: str) -> None:
        doc = self.find_by_id(id)
        if doc:
            self.db.delete(doc)
            self.db.commit()
