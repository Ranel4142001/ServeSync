import { FastifyInstance } from 'fastify';
import prisma from '@shared/infrastructure/PrismaClient';
import { PrismaOrganizationRepository } from './PrismaOrganizationRepository';
import { CreateOrganizationUseCase }     from '../application/CreateOrganization.usecase';

export async function organizationRoutes(app: FastifyInstance): Promise<void> {

  // ── Wire up dependencies ─────────────────────────────────
  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const createOrgUseCase       = new CreateOrganizationUseCase(organizationRepository);

  // ── POST /organizations ──────────────────────────────────
  // Creates a new organization (a new business/tenant)
  // This is the FIRST thing that must happen before any user can register
  app.post('/organizations', async (request, reply) => {

    // Extract name and optional slug from request body
    const body = request.body as {
      name:   string;
      slug?:  string;
    };

    // Make sure name was provided
    if (!body.name) {
      return reply.status(400).send({
        error: 'Organization name is required'
      });
    }

    // Run the use-case
    const result = await createOrgUseCase.execute({
      name: body.name,
      slug: body.slug,
    });

    // If something went wrong (e.g. slug taken) return 400
    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    // Return the created organization with 201 Created
    return reply.status(201).send(result.value);
  });

  // ── GET /organizations/:id ───────────────────────────────
  // Get a single organization by ID
  app.get('/organizations/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const org = await organizationRepository.findById(id);

    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }

    return reply.status(200).send({ organization: org.toJSON() });
  });
}