from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.tickets.infrastructure.persistence.ticket_repository import SqlAlchemyTicketRepository
from src.features.tickets.application.create_ticket import CreateTicketUseCase
from src.features.tickets.application.get_tickets import GetTicketsUseCase
from src.features.tickets.application.get_ticket_by_id import GetTicketByIdUseCase
from src.features.tickets.application.reply_to_ticket import ReplyToTicketUseCase
from src.features.tickets.application.close_ticket import CloseTicketUseCase
from src.features.tickets.presentation.schemas import (
    CreateTicketRequest, CreateTicketResponse,
    GetTicketsResponse, TicketResponseItem,
    TicketDetailsResponse, TicketInfo, MessageResponseItem,
    ReplyRequest, ReplyResponse, CloseTicketResponse
)
from src.features.tickets.presentation.gateway import (
    emit_ticket_created, emit_new_message, emit_ticket_updated
)
from src.features.auth.presentation.dependencies import get_current_user, CurrentUser, RequireRole
from src.shared.infrastructure.models import UserRole, User, TicketStatus

router = APIRouter(prefix="/tickets", tags=["Tickets"])

@router.post("", response_model=CreateTicketResponse, status_code=status.HTTP_201_CREATED)
async def create_ticket(
    req: CreateTicketRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = CreateTicketUseCase(ticket_repo)
    
    target_client_id = current_user.userId
    target_org_id = current_user.organizationId
    
    # Staff roles (Agent/Admin) can override the client and organization context
    if current_user.role in [UserRole.AGENT.value, UserRole.ADMIN.value]:
        if not req.clientId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Client selection is required when creating tickets on behalf of a customer"
            )
        target_client_id = req.clientId
        # If staff specifies organization, use it; otherwise default to staff's org
        target_org_id = req.organizationId if req.organizationId else current_user.organizationId

    result = use_case.execute(req, target_org_id, target_client_id)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    ticket = result.value
    
    # Broadcast to Socket.IO room
    ticket_json = {
        "id": ticket.id,
        "title": ticket.title,
        "status": ticket.status.value,
        "priority": ticket.priority.value,
        "category": ticket.category,
        "agentId": ticket.agentId,
        "clientId": ticket.clientId,
        "createdAt": ticket.createdAt.isoformat()
    }
    await emit_ticket_created(target_org_id, ticket_json)
    
    return CreateTicketResponse(
        message="Ticket created successfully",
        id=ticket.id,
        title=ticket.title,
        status=ticket.status,
        priority=ticket.priority
    )

@router.get("", response_model=GetTicketsResponse)
async def get_tickets(
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = GetTicketsUseCase(ticket_repo)
    
    result = use_case.execute(
        organization_id=current_user.organizationId,
        user_id=current_user.userId,
        role=current_user.role
    )
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    tickets = result.value
    
    # Batch load agent and client names
    user_ids = list(set(
        [t.agentId for t in tickets if t.agentId] +
        [t.clientId for t in tickets if t.clientId]
    ))
    
    name_map = {}
    if user_ids:
        users = db.query(User.id, User.firstName, User.lastName).filter(User.id.in_(user_ids)).all()
        name_map = {u.id: f"{u.firstName} {u.lastName}" for u in users}
        
    ticket_items = [
        TicketResponseItem(
            id=t.id,
            title=t.title,
            status=t.status,
            priority=t.priority,
            category=t.category or "Uncategorized",
            agentId=t.agentId,
            agentName=name_map.get(t.agentId) if t.agentId else None,
            clientId=t.clientId,
            clientName=name_map.get(t.clientId) if t.clientId else None,
            createdAt=t.createdAt
        )
        for t in tickets
    ]
    
    return GetTicketsResponse(tickets=ticket_items, total=len(ticket_items))

@router.get("/{id}", response_model=TicketDetailsResponse)
async def get_ticket_details(
    id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = GetTicketByIdUseCase(ticket_repo)
    
    result = use_case.execute(
        ticket_id=id,
        user_id=current_user.userId,
        role=current_user.role,
        organization_id=current_user.organizationId
    )
    if not result.is_success:
        status_code = status.HTTP_404_NOT_FOUND if "not found" in result.error.lower() else status.HTTP_403_FORBIDDEN
        raise HTTPException(status_code=status_code, detail=result.error)
        
    ticket, messages = result.value
    
    # Batch load authors for messages
    author_ids = list(set([m.authorId for m in messages if m.authorId]))
    author_map = {}
    if author_ids:
        users = db.query(User.id, User.firstName, User.lastName).filter(User.id.in_(author_ids)).all()
        author_map = {u.id: f"{u.firstName} {u.lastName}" for u in users}
        
    ticket_info = TicketInfo(
        id=ticket.id,
        title=ticket.title,
        status=ticket.status,
        priority=ticket.priority,
        category=ticket.category or "Uncategorized",
        aiTriage=ticket.aiTriage,
        createdAt=ticket.createdAt
    )
    
    message_items = [
        MessageResponseItem(
            id=m.id,
            body=m.body,
            authorId=m.authorId,
            isAiDraft=m.isAiDraft,
            createdAt=m.createdAt
        )
        for m in messages
    ]
    
    return TicketDetailsResponse(
        ticket=ticket_info,
        messages=message_items,
        totalMessages=len(message_items)
    )

@router.post("/{id}/reply", response_model=ReplyResponse, status_code=status.HTTP_201_CREATED)
async def reply_to_ticket(
    id: str,
    req: ReplyRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = ReplyToTicketUseCase(ticket_repo)
    
    result = use_case.execute(
        ticket_id=id,
        body=req.body,
        author_id=current_user.userId,
        is_ai_draft=False
    )
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    msg = result.value
    
    # Broadcast to Socket.IO ticket room
    msg_json = {
        "id": msg.id,
        "body": msg.body,
        "authorId": msg.authorId,
        "isAiDraft": msg.isAiDraft,
        "createdAt": msg.createdAt.isoformat(),
        "ticketId": msg.ticketId
    }
    await emit_new_message(id, msg_json)
    
    return ReplyResponse(
        message="Reply sent successfully",
        id=msg.id,
        body=msg.body,
        authorId=msg.authorId,
        createdAt=msg.createdAt
    )

@router.patch("/{id}/close", response_model=CloseTicketResponse)
async def close_ticket(
    id: str,
    current_user: CurrentUser = Depends(RequireRole(UserRole.AGENT, UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    ticket_repo = SqlAlchemyTicketRepository(db)
    use_case = CloseTicketUseCase(ticket_repo)
    
    result = use_case.execute(id)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    ticket = result.value
    
    # Broadcast ticket status update to organization
    ticket_json = {
        "id": ticket.id,
        "title": ticket.title,
        "status": ticket.status.value,
        "priority": ticket.priority.value,
        "category": ticket.category,
        "agentId": ticket.agentId,
        "clientId": ticket.clientId,
        "createdAt": ticket.createdAt.isoformat()
    }
    await emit_ticket_updated(current_user.organizationId, ticket_json)
    
    return CloseTicketResponse(
        message="Ticket closed successfully",
        id=ticket.id,
        status=ticket.status,
        updatedAt=ticket.updatedAt
    )
