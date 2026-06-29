import { FastifyInstance } from 'fastify';
import { Server }          from 'socket.io';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate, requireRole } from '../../auth/infrastructure/rbac.middleware';
import { Role }            from '../../auth/domain/Role.enum';
import { TicketPriority }  from '../domain/TicketPriority.enum';
import { PrismaTicketRepository } from './PrismaTicketRepository';
import { CreateTicketUseCase }    from '../application/CreateTicket.usecase';
import { GetTicketsUseCase }      from '../application/GetTickets.usecase';
import { GetTicketByIdUseCase }   from '../application/GetTicketById.usecase';
import { ReplyToTicketUseCase }   from '../application/ReplyToTicket.usecase';
import { CloseTicketUseCase }     from '../application/CloseTicket.usecase';
import {
  emitTicketCreated,
  emitNewMessage,
  emitTicketUpdated,
} from './tickets.gateway';

export function ticketRoutes(io: Server) {
  return async function (app: FastifyInstance): Promise<void> {

    const ticketRepository     = new PrismaTicketRepository(prisma);
    const createTicketUseCase  = new CreateTicketUseCase(ticketRepository);
    const getTicketsUseCase    = new GetTicketsUseCase(ticketRepository);
    const getTicketByIdUseCase = new GetTicketByIdUseCase(ticketRepository);
    const replyToTicketUseCase = new ReplyToTicketUseCase(ticketRepository);
    const closeTicketUseCase   = new CloseTicketUseCase(ticketRepository);

    // POST /tickets — create a new ticket (client only)
    app.post('/tickets', {
      preHandler: [authenticate, requireRole(Role.CLIENT)]
    }, async (request, reply) => {

      const body = request.body as {
        title:     string;
        priority?: TicketPriority;
        category?: string;
      };
      const { userId, organizationId } = request.currentUser;

      if (!body.title) {
        return reply.status(400).send({ error: 'Ticket title is required' });
      }

      const result = await createTicketUseCase.execute({
        title:          body.title,
        priority:       body.priority,
        category:       body.category,
        organizationId,
        clientId:       userId,
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      emitTicketCreated(io, organizationId, result.value.ticket);

      return reply.status(201).send({
        message:  'Ticket created successfully',
        id:       result.value.ticket.id,
        title:    result.value.ticket.title,
        status:   result.value.ticket.status,
        priority: result.value.ticket.priority,
      });
    });

    // GET /tickets — get all tickets (role-based)
    app.get('/tickets', {
      preHandler: [authenticate]
    }, async (request, reply) => {

      const { userId, organizationId, role } = request.currentUser;

      const result = await getTicketsUseCase.execute({
        userId,
        organizationId,
        role,
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      return reply.status(200).send({
        tickets: result.value.tickets.map(ticket => ({
          id:        ticket.id,
          title:     ticket.title,
          status:    ticket.status,
          priority:  ticket.priority,
          category:  ticket.category ?? 'Uncategorized',
          createdAt: ticket.createdAt,
        })),
        total: result.value.tickets.length,
      });
    });

    // GET /tickets/:id — get single ticket with messages
    app.get('/tickets/:id', {
      preHandler: [authenticate]
    }, async (request, reply) => {

      const { id } = request.params as { id: string };
      const { userId, organizationId, role } = request.currentUser;

      const result = await getTicketByIdUseCase.execute({
        ticketId: id,
        userId,
        organizationId,
        role,
      });

      if (!result.isSuccess) {
        const status = result.error?.includes('not found') ? 404 : 403;
        return reply.status(status).send({ error: result.error });
      }

      return reply.status(200).send({
        ticket: {
          id:        result.value.ticket.id,
          title:     result.value.ticket.title,
          status:    result.value.ticket.status,
          priority:  result.value.ticket.priority,
          category:  result.value.ticket.category ?? 'Uncategorized',
          aiTriage:  result.value.ticket.aiTriage,
          createdAt: result.value.ticket.createdAt,
        },
        messages: result.value.messages.map(msg => ({
          id:        msg.id,
          body:      msg.body,
          authorId:  msg.authorId,
          isAiDraft: msg.isAiDraft,
          createdAt: msg.createdAt,
        })),
        totalMessages: result.value.messages.length,
      });
    });

    // POST /tickets/:id/reply — add a reply to a ticket
    app.post('/tickets/:id/reply', {
      preHandler: [authenticate]
    }, async (request, reply) => {

      const { id }   = request.params as { id: string };
      const body     = request.body as { body: string };
      const { userId, role } = request.currentUser;

      if (!body.body) {
        return reply.status(400).send({ error: 'Reply body is required' });
      }

      const result = await replyToTicketUseCase.execute({
        ticketId:  id,
        body:      body.body,
        authorId:  userId,
        role,
        isAiDraft: false,
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      emitNewMessage(io, id, result.value.message);

      return reply.status(201).send({
        message:   'Reply sent successfully',
        id:        result.value.message.id,
        body:      result.value.message.body,
        authorId:  result.value.message.authorId,
        createdAt: result.value.message.createdAt,
      });
    });

    // PATCH /tickets/:id/close — close a ticket (agent/admin only)
    app.patch('/tickets/:id/close', {
      preHandler: [authenticate, requireRole(Role.AGENT, Role.ADMIN)]
    }, async (request, reply) => {

      const { id } = request.params as { id: string };
      const { userId, organizationId, role } = request.currentUser;

      const result = await closeTicketUseCase.execute({
        ticketId: id,
        userId,
        role,
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      emitTicketUpdated(io, organizationId, result.value.ticket);

      return reply.status(200).send({
        message:  'Ticket closed successfully',
        id:       result.value.ticket.id,
        status:   result.value.ticket.status,
        updatedAt: result.value.ticket.updatedAt,
      });
    });
  };
}