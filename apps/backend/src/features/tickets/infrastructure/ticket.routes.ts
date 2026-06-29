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

// io is passed in so routes can emit real-time events
// This is why it's a function that accepts io as a parameter
export function ticketRoutes(io: Server) {
  return async function (app: FastifyInstance): Promise<void> {

    // ── Wire up dependencies ───────────────────────────────
    // Same pattern as auth — repository → use-cases
    const ticketRepository   = new PrismaTicketRepository(prisma);
    const createTicketUseCase    = new CreateTicketUseCase(ticketRepository);
    const getTicketsUseCase      = new GetTicketsUseCase(ticketRepository);
    const getTicketByIdUseCase   = new GetTicketByIdUseCase(ticketRepository);
    const replyToTicketUseCase   = new ReplyToTicketUseCase(ticketRepository);
    const closeTicketUseCase     = new CloseTicketUseCase(ticketRepository);

    // ── POST /tickets ──────────────────────────────────────
    // Creates a new support ticket
    // Only CLIENTS can create tickets — agents work on them
    app.post('/tickets', {
      preHandler: [authenticate, requireRole(Role.CLIENT)]
    }, async (request, reply) => {

      // Extract ticket info from the request body
      const body = request.body as {
        title:     string;
        priority?: TicketPriority;
        category?: string;
      };

      // Get the logged-in user's info from the JWT token
      // authenticate middleware already verified and attached this
      const { userId, organizationId } = request.currentUser;

      const result = await createTicketUseCase.execute({
        title:          body.title,
        priority:       body.priority,
        category:       body.category,
        organizationId, // from JWT — client belongs to this org
        clientId:       userId, // from JWT — this client created it
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      // Notify all agents in the organization via Socket.io
      // They will see a new ticket appear on their dashboard
      // without refreshing the page
      emitTicketCreated(io, organizationId, result.value.ticket);

      return reply.status(201).send(result.value);
    });

    // ── GET /tickets ───────────────────────────────────────
    // Get all tickets
    // Clients see only their tickets
    // Agents and Admins see all tickets in their organization
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

      return reply.status(200).send(result.value);
    });

    // ── GET /tickets/:id ───────────────────────────────────
    // Get a single ticket with all its messages
    // Access control is enforced inside the use-case
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
        // 404 if not found, 403 if no access
        const status = result.error?.includes('not found') ? 404 : 403;
        return reply.status(status).send({ error: result.error });
      }

      return reply.status(200).send(result.value);
    });

    // ── POST /tickets/:id/reply ────────────────────────────
    // Add a reply to a ticket
    // Both clients and agents can reply
    app.post('/tickets/:id/reply', {
      preHandler: [authenticate]
    }, async (request, reply) => {

      const { id } = request.params as { id: string };
      const body   = request.body as { body: string };
      const { userId, role } = request.currentUser;

      if (!body.body) {
        return reply.status(400).send({ error: 'Reply body is required' });
      }

      const result = await replyToTicketUseCase.execute({
        ticketId:  id,
        body:      body.body,
        authorId:  userId,
        role,
        isAiDraft: false, // human reply — AI drafts come from /ai/draft
      });

      if (!result.isSuccess) {
        return reply.status(400).send({ error: result.error });
      }

      // Notify everyone viewing this ticket about the new message
      // e.g. agent is viewing ticket, client sends reply —
      // agent sees it appear instantly without refreshing
      emitNewMessage(io, id, result.value.message);

      return reply.status(201).send(result.value);
    });

    // ── PATCH /tickets/:id/close ───────────────────────────
    // Close a ticket — only agents and admins can do this
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

      // Notify all agents the ticket was closed
      emitTicketUpdated(io, organizationId, result.value.ticket);

      return reply.status(200).send(result.value);
    });
  };
}