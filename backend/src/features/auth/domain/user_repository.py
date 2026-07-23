from abc import ABC, abstractmethod
from typing import List, Optional
from src.shared.infrastructure.models import User

class IUserRepository(ABC):
    """
    Interface for User Database Operations.
    Abstracts implementation details from use cases.
    """
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[User]:
        pass

    @abstractmethod
    def find_by_email(self, email: str) -> Optional[User]:
        pass

    @abstractmethod
    def find_by_organization_id(self, organization_id: str) -> List[User]:
        pass

    @abstractmethod
    def save(self, user: User) -> User:
        pass

    @abstractmethod
    def delete(self, id: str) -> None:
        pass

    @abstractmethod
    def exists_by_email(self, email: str) -> bool:
        pass
