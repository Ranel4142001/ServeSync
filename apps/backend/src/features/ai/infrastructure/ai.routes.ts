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

  // ── Wire up dependencies ─────────────────────────────────
  const aiProvider       = new GeminiProvider();
  const ticketRepository = new PrismaTicketRepository(prisma);
  const userRepository   = new PrismaUserRepository(prisma);

  const triageTicketUseCase  = new TriageTicketUseCase(aiProvider, ticketRepository);
  const draftResponseUseCase = new DraftResponseUseCase(aiProvider, ticketRepository, userRepository);

  // ── POST /ai/triage/:ticketId ────────────────────────────
  // Analyzes a ticket and assigns category + priority
  // Only agents and admins can trigger this
  // In a real system this would be called automatically
  // when a new ticket is created
  app.post('/ai/triage/:ticketId', {
    preHandler: [authenticate, requireRole(Role.AGENT, Role.ADMIN)]
  }, async (request, reply) => {

    const { ticketId } = request.params as { ticketId: string };

    const result = await triageTicketUseCase.execute({ ticketId });

    if (!result.isSuccess) return reply.status(400).send({ error: result.error });
    return reply.status(200).send(result.value);
  });

  // ── POST /ai/draft/:ticketId ─────────────────────────────
  // Generates a draft response for the agent to review
  // Only agents and admins can request drafts
  // Clients never see this — it is an internal agent tool
  app.post('/ai/draft/:ticketId', {
    preHandler: [authenticate, requireRole(Role.AGENT, Role.ADMIN)]
  }, async (request, reply) => {

    const { ticketId } = request.params as { ticketId: string };
    const { userId }   = request.currentUser;

    const result = await draftResponseUseCase.execute({
      ticketId,
      agentId: userId,
    });

   if (!result.isSuccess) return reply.status(400).send({ error: result.error });
    return reply.status(200).send(result.value);    
  });
}