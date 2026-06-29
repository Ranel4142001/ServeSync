import { Entity }         from '@shared/domain/Entity';
import { TicketStatus }   from './TicketStatus.enum';
import { TicketPriority } from './TicketPriority.enum';

// All the data that makes up a Ticket
interface TicketProps {
  title:          string;
  status:         TicketStatus;
  priority:       TicketPriority;
  category:       string | null;  // e.g. "Billing", "Bug", "Feature Request"
  aiTriage:       string | null;  // AI-generated summary (Phase 4)
  organizationId: string;         // which business this ticket belongs to
  clientId:       string;         // the user who created this ticket
  agentId:        string | null;  // the agent assigned to handle it
  createdAt:      Date;
  updatedAt:      Date;
}

export class Ticket extends Entity<string> {
  private props: TicketProps;

  private constructor(props: TicketProps, id?: string) {
    super(id ?? '');
    this.props = props;
  }

  // ── Factory method ───────────────────────────────────────
  // Validates data before the ticket is created
  static create(props: TicketProps, id?: string): Ticket {

    // Title must not be empty
    if (!props.title || props.title.trim().length === 0) {
      throw new Error('Ticket title is required');
    }

    // Title must not be too long
    if (props.title.length > 255) {
      throw new Error('Ticket title must be less than 255 characters');
    }

    return new Ticket(props, id);
  }

  // ── Getters ──────────────────────────────────────────────
  get title():          string          { return this.props.title; }
  get status():         TicketStatus    { return this.props.status; }
  get priority():       TicketPriority  { return this.props.priority; }
  get category():       string | null   { return this.props.category; }
  get aiTriage():       string | null   { return this.props.aiTriage; }
  get organizationId(): string          { return this.props.organizationId; }
  get clientId():       string          { return this.props.clientId; }
  get agentId():        string | null   { return this.props.agentId; }
  get createdAt():      Date            { return this.props.createdAt; }
  get updatedAt():      Date            { return this.props.updatedAt; }

  // ── Business logic methods ───────────────────────────────
  // These are things a Ticket can DO — pure logic, no DB calls

  // Check if the ticket can still receive replies
  isOpen(): boolean {
    return this.props.status !== TicketStatus.CLOSED;
  }

  // Assign an agent to handle this ticket
  // Also moves status from OPEN to IN_PROGRESS automatically
  assignAgent(agentId: string): void {
    this.props.agentId = agentId;
    if (this.props.status === TicketStatus.OPEN) {
      this.props.status = TicketStatus.IN_PROGRESS;
    }
    this.props.updatedAt = new Date();
  }

  // Mark the ticket as resolved
  resolve(): void {
    if (this.props.status === TicketStatus.CLOSED) {
      throw new Error('Cannot resolve a closed ticket');
    }
    this.props.status    = TicketStatus.RESOLVED;
    this.props.updatedAt = new Date();
  }

  // Permanently close the ticket
  close(): void {
    this.props.status    = TicketStatus.CLOSED;
    this.props.updatedAt = new Date();
  }

  // Update the AI triage result (called in Phase 4)
  setAiTriage(triage: string): void {
    this.props.aiTriage  = triage;
    this.props.updatedAt = new Date();
  }

  // ── Serializer ───────────────────────────────────────────
  toJSON() {
    return {
      id:             this._id,
      title:          this.props.title,
      status:         this.props.status,
      priority:       this.props.priority,
      category:       this.props.category,
      aiTriage:       this.props.aiTriage,
      organizationId: this.props.organizationId,
      clientId:       this.props.clientId,
      agentId:        this.props.agentId,
      createdAt:      this.props.createdAt,
      updatedAt:      this.props.updatedAt,
    };
  }
}