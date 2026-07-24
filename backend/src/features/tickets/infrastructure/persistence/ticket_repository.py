from typing import List, Optional
from sqlalchemy.orm import Session
from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.infrastructure.models import Ticket, Message

class SqlAlchemyTicketRepository(ITicketRepository):
    """
    SQLAlchemy implementation of the Ticket Repository.
    """
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, id: str) -> Optional[Ticket]:
        return self.db.query(Ticket).filter(Ticket.id == id).first()

    def find_by_organization_id(self, organization_id: str) -> List[Ticket]:
        return self.db.query(Ticket).filter(
            Ticket.organizationId == organization_id
        ).order_by(Ticket.createdAt.desc()).all()

    def find_by_client_id(self, client_id: str) -> List[Ticket]:
        return self.db.query(Ticket).filter(
            Ticket.clientId == client_id
        ).order_by(Ticket.createdAt.desc()).all()

    def save(self, ticket: Ticket) -> Ticket:
        merged = self.db.merge(ticket)
        self.db.commit()
        self.db.refresh(merged)
        return merged

    def find_messages_by_ticket_id(self, ticket_id: str) -> List[Message]:
        return self.db.query(Message).filter(
            Message.ticketId == ticket_id
        ).order_by(Message.createdAt.asc()).all()

    def save_message(self, message: Message) -> Message:
        merged = self.db.merge(message)
        self.db.commit()
        self.db.refresh(merged)
        return merged
