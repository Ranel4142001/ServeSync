import json
from src.features.ai.domain.ai_provider import IAIProvider
from src.features.tickets.domain.ticket_repository import ITicketRepository
from src.shared.domain.result import Result

class TriageTicketUseCase:
    """
    UseCase to analyze and categorize tickets using AI.
    Updates the ticket's aiTriage payload in database.
    """
    def __init__(self, ai_provider: IAIProvider, ticket_repository: ITicketRepository) -> None:
        self.ai_provider = ai_provider
        self.ticket_repository = ticket_repository

    def execute(self, ticket_id: str) -> Result[dict]:
        ticket = self.ticket_repository.find_by_id(ticket_id)
        if not ticket:
            return Result.fail("Ticket not found")

        messages = self.ticket_repository.find_messages_by_ticket_id(ticket_id)
        first_message = messages[0].body if messages else ""

        # Request triage classification from AI Provider
        triage_result = self.ai_provider.triage_ticket(
            title=ticket.title,
            body=first_message
        )

        # Persist results as serialized JSON on the Ticket model
        triage_payload = {
            "category": triage_result["category"],
            "priority": triage_result["priority"],
            "summary": triage_result["summary"]
        }
        ticket.aiTriage = json.dumps(triage_payload)
        
        # Save ticket changes
        self.ticket_repository.save(ticket)

        return Result.ok(triage_payload)
