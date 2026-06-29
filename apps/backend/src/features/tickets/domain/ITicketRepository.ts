import { Ticket } from "./Ticket.entity";
import { Message } from "./Message.entity";
import { TicketStatus } from "./TicketStatus.enum";

// Contract for ticket and message persistence — no Prisma, just the shape of operations
export interface ITicketRepository {
  // Find a ticket by ID
  findById(id: string): Promise<Ticket | null>;

  // Find all tickets in an organization — used by agents and admins
  findByOrganizationId(organizationId: string): Promise<Ticket[]>;

  // Find all tickets created by a client — used by clients to see only their own
  findByClientId(clientId: string): Promise<Ticket[]>;

  // Find tickets by status within an organization
  findByStatus(organizationId: string, status: TicketStatus): Promise<Ticket[]>;

  // Save a new ticket or update an existing one
  save(ticket: Ticket): Promise<Ticket>;

  // Find all messages on a ticket
  findMessagesByTicketId(ticketId: string): Promise<Message[]>;

  // Save a new message on a ticket
  saveMessage(message: Message): Promise<Message>;
}
