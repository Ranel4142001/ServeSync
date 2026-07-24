from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.features.tickets.presentation.schemas import CreateTicketRequest
from src.shared.infrastructure.models import Ticket, TicketStatus, TicketPriority
from src.shared.domain.result import Result

class CreateTicketUseCase:
    """
    UseCase to open a new support ticket.
    """
    def __init__(self, ticket_repository: ITicketRepository) -> None:
        self.ticket_repository = ticket_repository

    def execute(self, req: CreateTicketRequest, organization_id: str, client_id: str) -> Result[Ticket]:
        new_ticket = Ticket(
            title=req.title,
            status=TicketStatus.OPEN,
            priority=req.priority or TicketPriority.MEDIUM,
            category=req.category or "Uncategorized",
            organizationId=organization_id,
            clientId=client_id,
            agentId=None
        )

        saved = self.ticket_repository.save(new_ticket)
        return Result.ok(saved)
