import { Ticket } from "./Ticket.entity";
import { Message } from "./Message.entity";
import { TicketStatus } from "./TicketStatus.enum";

export interface ITicketRepository {
  findById(id: number): Promise<Ticket | null>;
  findByOrganizationId(organizationId: number): Promise<Ticket[]>;
  
  // Lookup tickets using the client's numeric ID
  findByClientId(clientId: number): Promise<Ticket[]>;
  
  findByStatus(organizationId: number, status: TicketStatus): Promise<Ticket[]>;

  save(ticket: Ticket): Promise<Ticket>;

  findMessagesByTicketId(ticketId: number): Promise<Message[]>;
  
  saveMessage(message: Message): Promise<Message>;
}