from typing import Tuple, List
from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.infrastructure.models import Ticket, Message, UserRole
from src.shared.domain.result import Result

class GetTicketByIdUseCase:
    """
    UseCase to retrieve a single ticket with its conversation history.
    Enforces role authorization boundaries.
    """
    def __init__(self, ticket_repository: ITicketRepository) -> None:
        self.ticket_repository = ticket_repository

    def execute(
        self, 
        ticket_id: str, 
        user_id: str, 
        role: str, 
        organization_id: str
    ) -> Result[Tuple[Ticket, List[Message]]]:
        ticket = self.ticket_repository.find_by_id(ticket_id)
        if not ticket:
            return Result.fail("Ticket not found")

        # Boundary checks
        if role == UserRole.CLIENT.value and ticket.clientId != user_id:
            return Result.fail("You do not have access to this ticket")
            
        if role != UserRole.CLIENT.value and ticket.organizationId != organization_id:
            return Result.fail("You do not have access to this ticket")

        messages = self.ticket_repository.find_messages_by_ticket_id(ticket_id)
        return Result.ok((ticket, messages))
