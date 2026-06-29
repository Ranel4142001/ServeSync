import { PrismaClient, TicketStatus as PrismaTicketStatus,
  TicketPriority as PrismaTicketPriority }    from '@prisma/client';
import { ITicketRepository } from '../domain/ITicketRepository';
import { Ticket }          from '../domain/Ticket.entity';
import { Message }         from '../domain/Message.entity';
import { TicketStatus }    from '../domain/TicketStatus.enum';
import { TicketPriority }  from '../domain/TicketPriority.enum';

export class PrismaTicketRepository implements ITicketRepository {

  constructor(private readonly prisma: PrismaClient) {}

  // ── Private helpers ──────────────────────────────────────
  // Converts a raw Prisma row into a clean Ticket entity
  private toTicketEntity(raw: any): Ticket {
    return Ticket.create(
      {
        title:          raw.title,
        status:         raw.status as TicketStatus,
        priority:       raw.priority as TicketPriority,
        category:       raw.category,
        aiTriage:       raw.aiTriage,
        organizationId: raw.organizationId,
        clientId:       raw.clientId,
        agentId:        raw.agentId,
        createdAt:      raw.createdAt,
        updatedAt:      raw.updatedAt,
      },
      raw.id
    );
  }

  // Converts a raw Prisma row into a clean Message entity
  private toMessageEntity(raw: any): Message {
    return Message.create(
      {
        body:      raw.body,
        isAiDraft: raw.isAiDraft,
        ticketId:  raw.ticketId,
        authorId:  raw.authorId,
        createdAt: raw.createdAt,
      },
      raw.id
    );
  }

  async findById(id: string): Promise<Ticket | null> {
    const raw = await this.prisma.ticket.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toTicketEntity(raw);
  }

  async findByOrganizationId(organizationId: string): Promise<Ticket[]> {
    const rows = await this.prisma.ticket.findMany({
      where:   { organizationId },
      orderBy: { createdAt: 'desc' }, // newest first
    });
    return rows.map(row => this.toTicketEntity(row));
  }

  async findByClientId(clientId: string): Promise<Ticket[]> {
    const rows = await this.prisma.ticket.findMany({
      where:   { clientId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(row => this.toTicketEntity(row));
  }

  async findByStatus(
    organizationId: string,
    status: TicketStatus
  ): Promise<Ticket[]> {
    const rows = await this.prisma.ticket.findMany({
      where:   { organizationId, status: status as unknown as PrismaTicketStatus, },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(row => this.toTicketEntity(row));
  }

  async save(ticket: Ticket): Promise<Ticket> {
    const data = {
      title:          ticket.title,
      status:         ticket.status as unknown as PrismaTicketStatus,
      priority:       ticket.priority as unknown as PrismaTicketPriority,
      category:       ticket.category,
      aiTriage:       ticket.aiTriage,
      organizationId: ticket.organizationId,
      clientId:       ticket.clientId,
      agentId:        ticket.agentId,
      updatedAt:      new Date(),
    };

    const raw = await this.prisma.ticket.upsert({
      where:  { id: ticket.id || '' },
      update: data,
      create: { ...data, createdAt: new Date() },
    });

    return this.toTicketEntity(raw);
  }

  async findMessagesByTicketId(ticketId: string): Promise<Message[]> {
    const rows = await this.prisma.message.findMany({
      where:   { ticketId },
      orderBy: { createdAt: 'asc' }, // oldest first — conversation order
    });
    return rows.map(row => this.toMessageEntity(row));
  }

  async saveMessage(message: Message): Promise<Message> {
    const raw = await this.prisma.message.create({
      data: {
        body:      message.body,
        isAiDraft: message.isAiDraft,
        ticketId:  message.ticketId,
        authorId:  message.authorId,
        createdAt: new Date(),
      }
    });
    return this.toMessageEntity(raw);
  }
}