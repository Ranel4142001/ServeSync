from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.infrastructure.models import Ticket, TicketStatus
from src.shared.domain.result import Result

class CloseTicketUseCase:
    """
    UseCase to close an active support ticket.
    """
    def __init__(self, ticket_repository: ITicketRepository) -> None:
        self.ticket_repository = ticket_repository

    def execute(self, ticket_id: str) -> Result[Ticket]:
        ticket = self.ticket_repository.find_by_id(ticket_id)
        if not ticket:
            return Result.fail("Ticket not found")

        ticket.status = TicketStatus.CLOSED
        saved = self.ticket_repository.save(ticket)
        return Result.ok(saved)
