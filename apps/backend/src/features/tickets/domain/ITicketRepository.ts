import { Ticket }  from './Ticket.entity';
import { Message } from './Message.entity';
import { TicketStatus } from './TicketStatus.enum';

// The CONTRACT — defines what operations are possible on tickets
// No Prisma here — just pure TypeScript interfaces
export interface ITicketRepository {

  // ── Ticket operations ────────────────────────────────────

  // Find a single ticket by its ID
  findById(id: string): Promise<Ticket | null>;

  // Find all tickets belonging to one organization
  // Used by agents and admins to see all tickets
  findByOrganizationId(organizationId: string): Promise<Ticket[]>;

  // Find all tickets created by a specific client
  // Used by clients to see only THEIR tickets
  findByClientId(clientId: string): Promise<Ticket[]>;

  // Find tickets filtered by status
  // e.g. get all OPEN tickets for an organization
  findByStatus(
    organizationId: string,
    status: TicketStatus
  ): Promise<Ticket[]>;

  // Save a new ticket OR update an existing one
  save(ticket: Ticket): Promise<Ticket>;

  // ── Message operations ───────────────────────────────────
  // Messages live inside tickets so they share the same repository

  // Get all messages for a specific ticket
  findMessagesByTicketId(ticketId: string): Promise<Message[]>;

  // Save a new message on a ticket
  saveMessage(message: Message): Promise<Message>;
}