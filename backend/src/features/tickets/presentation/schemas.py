from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from src.shared.infrastructure.models import TicketStatus, TicketPriority

class CreateTicketRequest(BaseModel):
    title: str = Field(min_length=1)
    priority: Optional[TicketPriority] = TicketPriority.MEDIUM
    category: Optional[str] = "Uncategorized"
    clientId: Optional[str] = None
    organizationId: Optional[str] = None

class CreateTicketResponse(BaseModel):
    message: str
    id: str
    title: str
    status: TicketStatus
    priority: TicketPriority

class TicketResponseItem(BaseModel):
    id: str
    title: str
    status: TicketStatus
    priority: TicketPriority
    category: str
    agentId: Optional[str]
    agentName: Optional[str]
    clientId: Optional[str]
    clientName: Optional[str]
    createdAt: datetime

class GetTicketsResponse(BaseModel):
    tickets: List[TicketResponseItem]
    total: int

class MessageResponseItem(BaseModel):
    id: str
    body: str
    authorId: Optional[str]
    isAiDraft: bool
    createdAt: datetime

class TicketInfo(BaseModel):
    id: str
    title: str
    status: TicketStatus
    priority: TicketPriority
    category: str
    aiTriage: Optional[str]
    createdAt: datetime

class TicketDetailsResponse(BaseModel):
    ticket: TicketInfo
    messages: List[MessageResponseItem]
    totalMessages: int

class ReplyRequest(BaseModel):
    body: str = Field(min_length=1)

class ReplyResponse(BaseModel):
    message: str
    id: str
    body: str
    authorId: Optional[str]
    createdAt: datetime

class CloseTicketResponse(BaseModel):
    message: str
    id: str
    status: TicketStatus
    updatedAt: datetime
