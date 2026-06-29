import { Entity } from "@shared/domain/Entity";
import { TicketStatus } from "./TicketStatus.enum";
import { TicketPriority } from "./TicketPriority.enum";

// Shape of data required to construct a Ticket
interface TicketProps {
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null; // e.g. "Billing", "Bug", "Feature Request"
  aiTriage: string | null;
  organizationId: string;
  clientId: string;
  agentId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Ticket extends Entity<string> {
  private props: TicketProps;

  private constructor(props: TicketProps, id?: string) {
    super(id ?? "");
    this.props = props;
  }

  // Factory method — validates title before creating
  static create(props: TicketProps, id?: string): Ticket {
    if (!props.title || props.title.trim().length === 0) {
      throw new Error("Ticket title is required");
    }

    if (props.title.length > 255) {
      throw new Error("Ticket title must be less than 255 characters");
    }

    return new Ticket(props, id);
  }

  // Getters
  get title(): string {
    return this.props.title;
  }
  get status(): TicketStatus {
    return this.props.status;
  }
  get priority(): TicketPriority {
    return this.props.priority;
  }
  get category(): string | null {
    return this.props.category;
  }
  get aiTriage(): string | null {
    return this.props.aiTriage;
  }
  get organizationId(): string {
    return this.props.organizationId;
  }
  get clientId(): string {
    return this.props.clientId;
  }
  get agentId(): string | null {
    return this.props.agentId;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  // Business logic — no DB calls

  // Returns true if the ticket can still receive replies
  isOpen(): boolean {
    return this.props.status !== TicketStatus.CLOSED;
  }

  // Assign an agent; automatically moves status from OPEN to IN_PROGRESS
  assignAgent(agentId: string): void {
    this.props.agentId = agentId;
    if (this.props.status === TicketStatus.OPEN) {
      this.props.status = TicketStatus.IN_PROGRESS;
    }
    this.props.updatedAt = new Date();
  }

  // Mark as resolved; throws if already closed
  resolve(): void {
    if (this.props.status === TicketStatus.CLOSED) {
      throw new Error("Cannot resolve a closed ticket");
    }
    this.props.status = TicketStatus.RESOLVED;
    this.props.updatedAt = new Date();
  }

  // Permanently close the ticket
  close(): void {
    this.props.status = TicketStatus.CLOSED;
    this.props.updatedAt = new Date();
  }

  // Update the AI triage result on the ticket
  setAiTriage(triage: string): void {
    this.props.aiTriage = triage;
    this.props.updatedAt = new Date();
  }

  // Serialize to plain object for HTTP responses
  toJSON() {
    return {
      id: this._id,
      title: this.props.title,
      status: this.props.status,
      priority: this.props.priority,
      category: this.props.category,
      aiTriage: this.props.aiTriage,
      organizationId: this.props.organizationId,
      clientId: this.props.clientId,
      agentId: this.props.agentId,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
