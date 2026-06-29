import { FastifyInstance } from 'fastify';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate, requireRole } from '../../auth/infrastructure/rbac.middleware';
import { Role }                      from '../../auth/domain/Role.enum';
import { GeminiProvider }            from './GeminiProvider';
import { PrismaTicketRepository }    from '../../tickets/infrastructure/PrismaTicketRepository';
import { PrismaUserRepository }      from '../../auth/infrastructure/PrismaUserRepository';
import { TriageTicketUseCase }       from '../application/TriageTicket.usecase';
import { DraftResponseUseCase }      from '../application/DraftResponse.usecase';

export async function aiRoutes(app: FastifyInstance): Promise<void> {

  const aiProvider       = new GeminiProvider();
  const ticketRepository = new PrismaTicketRepository(prisma);
  const userRepository   = new PrismaUserRepository(prisma);

  const triageTicketUseCase  = new TriageTicketUseCase(aiProvider, ticketRepository);
  const draftResponseUseCase = new DraftResponseUseCase(aiProvider, ticketRepository, userRepository);

  // POST /ai/triage/:ticketId — analyze a ticket and assign category + priority
  app.post('/ai/triage/:ticketId', {
    preHandler: [authenticate, requireRole(Role.AGENT, Role.ADMIN)]
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };

    if (!ticketId) {
      return reply.status(400).send({ error: 'Ticket ID is required' });
    }

    const result = await triageTicketUseCase.execute({ ticketId });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // POST /ai/draft/:ticketId — generate a draft response for the agent to review
  app.post('/ai/draft/:ticketId', {
    preHandler: [authenticate, requireRole(Role.AGENT, Role.ADMIN)]
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const { userId }   = request.currentUser;

    if (!ticketId) {
      return reply.status(400).send({ error: 'Ticket ID is required' });
    }

    const result = await draftResponseUseCase.execute({
      ticketId,
      agentId: userId,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });
}