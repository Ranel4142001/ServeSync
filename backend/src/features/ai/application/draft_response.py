import json
from src.features.ai.domain.ai_provider import IAIProvider
from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.features.auth.domain.user_repository import IUserRepository
from src.shared.infrastructure.models import UserRole
from src.shared.domain.result import Result

class DraftResponseUseCase:
    """
    UseCase to generate automated draft responses for agent preview.
    Retrieves full message conversation history and feeds context to AI.
    """
    def __init__(
        self, 
        ai_provider: IAIProvider, 
        ticket_repository: ITicketRepository,
        user_repository: IUserRepository
    ) -> None:
        self.ai_provider = ai_provider
        self.ticket_repository = ticket_repository
        self.user_repository = user_repository

    def execute(self, ticket_id: str) -> Result[dict]:
        ticket = self.ticket_repository.find_by_id(ticket_id)
        if not ticket:
            return Result.fail("Ticket not found")

        messages = self.ticket_repository.find_messages_by_ticket_id(ticket_id)
        if not messages:
            return Result.fail("No messages found on this ticket")

        # Map conversation messages to simple roles
        conversation = []
        for msg in messages:
            role = "agent"
            if msg.authorId:
                author = self.user_repository.find_by_id(msg.authorId)
                if author and author.role == UserRole.CLIENT:
                    role = "client"
            conversation.append({
                "role": role,
                "body": msg.body
            })

        # Determine Category
        category = "General"
        if ticket.aiTriage:
            try:
                triage = json.loads(ticket.aiTriage)
                category = triage.get("category", "General")
            except Exception:
                pass

        # Call AI response generator
        draft_result = self.ai_provider.draft_response(
            ticket_title=ticket.title,
            ticket_category=category,
            messages=conversation
        )

        return Result.ok({"draft": draft_result["draft"]})
