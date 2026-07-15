import { FastifyInstance } from 'fastify';
import prisma from '@shared/infrastructure/PrismaClient';
import { PrismaOrganizationRepository } from '../infrastructure/persistence/PrismaOrganizationRepository';
import { CreateOrganizationUseCase }     from '../application/CreateOrganization.usecase';
import { decodeId, encodeId } from '@shared/utils/idGenerators';
import { authenticate, requireRole } from '../../auth/presentation/rbac.middleware';
import { Role }                      from '../../auth/domain/Role.enum';

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

    const org = await organizationRepository.findById(decodeId(id));

    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }

    return reply.status(200).send({
      id:        org.id,
      code:      org.code,
      name:      org.name,
      slug:      org.slug,
      createdAt: org.createdAt,
    });
  });

  // PATCH /organizations/:id — update organization
  app.patch('/organizations/:id', {
    preHandler: [authenticate, requireRole(Role.ADMIN)]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const { name, slug } = request.body as { name?: string; slug?: string };

    const decodedId = decodeId(id);
    const org = await organizationRepository.findById(decodedId);

    if (!org) {
      return reply.status(404).send({ error: 'Organization not found' });
    }

    if (slug) {
      const slugRegex = /^[a-z0-9-]+$/;
      if (!slugRegex.test(slug)) {
        return reply.status(400).send({ error: 'Slug must only contain lowercase letters, numbers, and hyphens' });
      }
    }

    const updated = await prisma.organization.update({
      where: { id: decodedId },
      data: {
        name: name ?? org.name,
        slug: slug ?? org.slug,
      }
    });

    return reply.status(200).send({
      id:        updated.id,
      code:      encodeId('org', updated.id),
      name:      updated.name,
      slug:      updated.slug,
      createdAt: updated.createdAt,
    });
  });
}