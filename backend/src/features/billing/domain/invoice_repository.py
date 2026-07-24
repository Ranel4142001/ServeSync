from abc import ABC, abstractmethod
from typing import List, Optional
from src.shared.infrastructure.models import Invoice

class IInvoiceRepository(ABC):
    """
    Interface for Invoice database operations.
    """
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[Invoice]:
        pass

    @abstractmethod
    def find_by_organization_id(self, organization_id: str) -> List[Invoice]:
        pass

    @abstractmethod
    def find_unpaid_by_organization_id(self, organization_id: str) -> List[Invoice]:
        pass

    @abstractmethod
    def save(self, invoice: Invoice) -> Invoice:
        pass
