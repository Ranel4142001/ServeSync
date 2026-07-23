from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.infrastructure.models import Message, TicketStatus
from src.shared.domain.result import Result

class ReplyToTicketUseCase:
    """
    UseCase to post a reply message to a ticket thread.
    Rejects actions on closed tickets.
    """
    def __init__(self, ticket_repository: ITicketRepository) -> None:
        self.ticket_repository = ticket_repository

    def execute(
        self, 
        ticket_id: str, 
        body: str, 
        author_id: str, 
        is_ai_draft: bool = False
    ) -> Result[Message]:
        ticket = self.ticket_repository.find_by_id(ticket_id)
        if not ticket:
            return Result.fail("Ticket not found")

        if ticket.status == TicketStatus.CLOSED:
            return Result.fail("Cannot reply to a closed ticket")

        new_message = Message(
            body=body,
            isAiDraft=is_ai_draft,
            ticketId=ticket_id,
            authorId=author_id
        )

        saved = self.ticket_repository.save_message(new_message)
        return Result.ok(saved)
