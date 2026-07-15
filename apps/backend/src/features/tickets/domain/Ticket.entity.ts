import { Entity } from "@shared/domain/Entity";
import { uuidv7 } from "@shared/utils/idGenerators";
import { TicketStatus } from "./TicketStatus.enum";
import { TicketPriority } from "./TicketPriority.enum";

interface TicketProps {
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string | null;
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
    super(id ?? uuidv7());
    this.props = props;
  }

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
  get title(): string { return this.props.title; }
  get status(): TicketStatus { return this.props.status; }
  get priority(): TicketPriority { return this.props.priority; }
  get category(): string | null { return this.props.category; }
  get aiTriage(): string | null { return this.props.aiTriage; }
  get organizationId(): string { return this.props.organizationId; }
  get clientId(): string { return this.props.clientId; }
  get agentId(): string | null { return this.props.agentId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  isOpen(): boolean {
    return this.props.status !== TicketStatus.CLOSED;
  }

  assignAgent(agentId: string): void {
    this.props.agentId = agentId;
    if (this.props.status === TicketStatus.OPEN) {
      this.props.status = TicketStatus.IN_PROGRESS;
    }
    this.props.updatedAt = new Date();
  }

  resolve(): void {
    if (this.props.status === TicketStatus.CLOSED) {
      throw new Error("Cannot resolve a closed ticket");
    }
    this.props.status = TicketStatus.RESOLVED;
    this.props.updatedAt = new Date();
  }

  close(): void {
    this.props.status = TicketStatus.CLOSED;
    this.props.updatedAt = new Date();
  }

  setAiTriage(triage: string): void {
    this.props.aiTriage = triage;
    this.props.updatedAt = new Date();
  }

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