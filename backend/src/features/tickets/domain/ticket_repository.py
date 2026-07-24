from abc import ABC, abstractmethod
from typing import List, Optional
from src.shared.infrastructure.models import Ticket, Message

class ITicketRepository(ABC):
    """
    Interface for Ticket database operations.
    """
    @abstractmethod
    def find_by_id(self, id: str) -> Optional[Ticket]:
        pass

    @abstractmethod
    def find_by_organization_id(self, organization_id: str) -> List[Ticket]:
        pass

    @abstractmethod
    def find_by_client_id(self, client_id: str) -> List[Ticket]:
        pass

    @abstractmethod
    def save(self, ticket: Ticket) -> Ticket:
        pass

    @abstractmethod
    def find_messages_by_ticket_id(self, ticket_id: str) -> List[Message]:
        pass

    @abstractmethod
    def save_message(self, message: Message) -> Message:
        pass
