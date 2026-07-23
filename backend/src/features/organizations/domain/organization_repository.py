from abc import ABC, abstractmethod
from typing import Optional
from src.shared.infrastructure.models import Organization

class IOrganizationRepository(ABC):
    """
    Interface for Organization database operations.
    """
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[Organization]:
        pass

    @abstractmethod
    def find_by_slug(self, slug: str) -> Optional[Organization]:
        pass

    @abstractmethod
    def save(self, organization: Organization) -> Organization:
        pass

    @abstractmethod
    def exists_by_slug(self, slug: str) -> bool:
        pass
