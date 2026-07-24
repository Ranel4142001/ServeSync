import enum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Float, Text, Enum
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship
from src.database import Base
from src.shared.utils.id_generator import generate_uuid7

class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    AGENT = "AGENT"
    ADMIN = "ADMIN"

class TicketStatus(str, enum.Enum):
    OPEN = "OPEN"
    IN_PROGESS = "IN_PROGESS"  # Note: matches the Prisma database schema typo
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class TicketPriority(str, enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    URGENT = "URGENT"

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    code = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="organization", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="organization", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    email = Column(String, unique=True, nullable=False, index=True)
    passwordHash = Column(String, nullable=False)
    firstName = Column(String, nullable=False)
    lastName = Column(String, nullable=False)
    role = Column(Enum(UserRole, name="role"), default=UserRole.CLIENT, nullable=False)
    isActive = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    organizationId = Column(PG_UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    @property
    def fullName(self) -> str:
        return f"{self.firstName} {self.lastName}"

    # Relationships
    organization = relationship("Organization", back_populates="users")
    assigned_tickets = relationship("Ticket", foreign_keys="[Ticket.agentId]", back_populates="agent")
    client_tickets = relationship("Ticket", foreign_keys="[Ticket.clientId]", back_populates="client")
    messages = relationship("Message", back_populates="author")

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    title = Column(String, nullable=False)
    status = Column(Enum(TicketStatus, name="ticketstatus"), default=TicketStatus.OPEN, nullable=False)
    priority = Column(Enum(TicketPriority, name="ticketpriority"), default=TicketPriority.MEDIUM, nullable=False)
    category = Column(String, default="Uncategorized", nullable=True)
    aiTriage = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    organizationId = Column(PG_UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    clientId = Column(PG_UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    agentId = Column(PG_UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    organization = relationship("Organization", back_populates="tickets")
    client = relationship("User", foreign_keys=[clientId], back_populates="client_tickets")
    agent = relationship("User", foreign_keys=[agentId], back_populates="assigned_tickets")
    messages = relationship("Message", back_populates="ticket", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="ticket", cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    body = Column(Text, nullable=False)
    isAiDraft = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    ticketId = Column(PG_UUID(as_uuid=False), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)
    authorId = Column(PG_UUID(as_uuid=False), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    ticket = relationship("Ticket", back_populates="messages")
    author = relationship("User", back_populates="messages")

class Document(Base):
    __tablename__ = "documents"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    fileName = Column(String, nullable=False)
    s3Key = Column(String, nullable=False)
    mimeType = Column(String, nullable=False)
    sizeBytes = Column(Float, nullable=False) # Prisma Int mapped to Postgres Integer/BigInt -> float or int in Python is fine, float matches sizeBytes limit
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    ticketId = Column(PG_UUID(as_uuid=False), ForeignKey("tickets.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    ticket = relationship("Ticket", back_populates="documents")

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(PG_UUID(as_uuid=False), primary_key=True, default=generate_uuid7)
    number = Column(String, unique=True, nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    description = Column(String, nullable=True)
    paidAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    organizationId = Column(PG_UUID(as_uuid=False), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)

    # Relationships
    organization = relationship("Organization", back_populates="invoices")

    @property
    def isPaid(self) -> bool:
        return self.paidAt is not None

    @property
    def formattedAmount(self) -> str:
        return f"${self.amount:,.2f}"
