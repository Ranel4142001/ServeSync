from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.ai.infrastructure.providers.gemini_provider import GeminiProvider
from src.features.tickets.infrastructure.persistence.ticket_repository import SqlAlchemyTicketRepository
from src.features.auth.infrastructure.persistence.user_repository import SqlAlchemyUserRepository
from src.features.ai.application.triage_ticket import TriageTicketUseCase
from src.features.ai.application.draft_response import DraftResponseUseCase
from src.features.auth.presentation.dependencies import RequireRole, CurrentUser
from src.shared.infrastructure.models import UserRole

router = APIRouter(prefix="/ai", tags=["AI Copilot"])

@router.post("/triage/{ticketId}")
def triage_ticket(
    ticketId: str,
    current_user: CurrentUser = Depends(RequireRole(UserRole.AGENT, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    ai_provider = GeminiProvider()
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = TriageTicketUseCase(ai_provider, ticket_repo)
    
    result = use_case.execute(ticketId)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    return result.value

@router.post("/draft/{ticketId}")
def generate_draft(
    ticketId: str,
    current_user: CurrentUser = Depends(RequireRole(UserRole.AGENT, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    ai_provider = GeminiProvider()
    ticket_repo = SqlAlchemyTicketRepository(db)
    user_repo = SqlAlchemyUserRepository(db)
    use_case = DraftResponseUseCase(ai_provider, ticket_repo, user_repo)
    
    result = use_case.execute(ticketId)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    return result.value
