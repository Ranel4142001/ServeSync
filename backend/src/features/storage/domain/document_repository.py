from abc import ABC, abstractmethod
from typing import List, Optional
from src.shared.infrastructure.models import Document

class IDocumentRepository(ABC):
    """
    Interface for Document database operations.
    """
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[Document]:
        pass

    @abstractmethod
    def find_by_ticket_id(self, ticket_id: str) -> List[Document]:
        pass

    @abstractmethod
    def save(self, document: Document) -> Document:
        pass

    @abstractmethod
    def delete(self, id: str) -> None:
        pass
