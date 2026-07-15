import { Ticket } from "./Ticket.entity";
import { Message } from "./Message.entity";
import { TicketStatus } from "./TicketStatus.enum";

export interface ITicketRepository {
  findById(id: string): Promise<Ticket | null>;
  findByOrganizationId(organizationId: string): Promise<Ticket[]>;
  
  // Lookup tickets using the client's string ID
  findByClientId(clientId: string): Promise<Ticket[]>;
  
  findByStatus(organizationId: string, status: TicketStatus): Promise<Ticket[]>;

  save(ticket: Ticket): Promise<Ticket>;

  findMessagesByTicketId(ticketId: string): Promise<Message[]>;
  
  saveMessage(message: Message): Promise<Message>;
}