import { FastifyInstance } from 'fastify';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate }    from '../../auth/presentation/rbac.middleware';
import { S3StorageProvider }        from '../infrastructure/providers/S3StorageProvider';
import { PrismaDocumentRepository } from '../infrastructure/persistence/PrismaDocumentRepository';
import { UploadFileUseCase }        from '../application/UploadFile.usecase';
import { GetFileUrlUseCase }        from '../application/GetFileUrl.usecase';
import { decodeId } from '@shared/utils/idGenerators';

export async function storageRoutes(app: FastifyInstance): Promise<void> {

  const storageProvider    = new S3StorageProvider();
  const documentRepository = new PrismaDocumentRepository(prisma);
  const uploadFileUseCase  = new UploadFileUseCase(documentRepository);
  const getFileUrlUseCase  = new GetFileUrlUseCase(storageProvider, documentRepository);

  // POST /tickets/:ticketId/documents — upload a file and attach it to a ticket
  app.post('/tickets/:ticketId/documents', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    const { ticketId }      = request.params as { ticketId: string };
    const { organizationId } = request.currentUser;

    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }

    const buffer    = Buffer.concat(chunks);
    const sizeBytes = buffer.length;

    const result = await uploadFileUseCase.execute({
      fileName: data.filename,
      buffer,
      mimeType:  data.mimetype,
      sizeBytes,
      ticketId:       decodeId(ticketId),
      organizationId,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send(result.value);
  });

  // GET /documents/:id/url — get a temporary signed URL to download a file
  app.get('/documents/:id/url', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    if (!id) {
      return reply.status(400).send({ error: 'Document ID is required' });
    }

    const result = await getFileUrlUseCase.execute({ documentId: decodeId(id) });

    if (!result.isSuccess) {
      return reply.status(404).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // GET /tickets/:ticketId/documents — get all documents attached to a ticket
  app.get('/tickets/:ticketId/documents', {
    preHandler: [authenticate]
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };

    if (!ticketId) {
      return reply.status(400).send({ error: 'Ticket ID is required' });
    }

    const documents = await documentRepository.findByTicketId(decodeId(ticketId));

    return reply.status(200).send({
      documents: documents.map(d => d.toJSON()),
    });
  });
}