import { FastifyInstance } from 'fastify';
import prisma from '@shared/infrastructure/PrismaClient';
import { PrismaOrganizationRepository } from './PrismaOrganizationRepository';
import { CreateOrganizationUseCase }     from '../application/CreateOrganization.usecase';

export async function organizationRoutes(app: FastifyInstance): Promise<void> {

  const organizationRepository = new PrismaOrganizationRepository(prisma);
  const createOrgUseCase       = new CreateOrganizationUseCase(organizationRepository);

  // POST /organizations — create a new organization
  app.post('/organizations', async (request, reply) => {
    const body = request.body as { name: string; slug?: string };

    if (!body.name) {
      return reply.status(400).send({ error: 'Organization name is required' });
    }

    const result = await createOrgUseCase.execute({
      name: body.name,
      slug: body.slug,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send({
      message: `Organization created successfully`,
      id:      result.value.organization.id,
      name:    result.value.organization.name,
      slug:    result.value.organization.slug,
    });
  });

  // GET /organizations/:id — get a single organization
  app.get('/organizations/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const org = await organizationRepository.findById(id);

    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }

    return reply.status(200).send({
      id:        org.id,
      name:      org.name,
      slug:      org.slug,
      createdAt: org.createdAt,
    });
  });
}