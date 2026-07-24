from typing import List
from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.infrastructure.models import Ticket, UserRole
from src.shared.domain.result import Result

class GetTicketsUseCase:
    """
    UseCase to list support tickets.
    Enforces that Clients only view their own tickets,
    while Agents and Admins view all tickets in their organization.
    """
    def __init__(self, ticket_repository: ITicketRepository) -> None:
        self.ticket_repository = ticket_repository

    def execute(self, organization_id: str, user_id: str, role: str) -> Result[List[Ticket]]:
        if role == UserRole.CLIENT.value:
            tickets = self.ticket_repository.find_by_client_id(user_id)
        else:
            tickets = self.ticket_repository.find_by_organization_id(organization_id)
            
        return Result.ok(tickets)
