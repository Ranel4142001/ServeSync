import { FastifyInstance } from 'fastify';
import prisma              from '@shared/infrastructure/PrismaClient';
import { authenticate }    from '../../auth/infrastructure/rbac.middleware';
import { S3StorageProvider }         from './S3StorageProvider';
import { PrismaDocumentRepository }  from './PrismaDocumentRepository';
import { UploadFileUseCase }         from '../application/UploadFile.usecase';
import { GetFileUrlUseCase }         from '../application/GetFileUrl.usecase';

export async function storageRoutes(app: FastifyInstance): Promise<void> {

  // ── Wire up dependencies ─────────────────────────────────
  const storageProvider    = new S3StorageProvider();
  const documentRepository = new PrismaDocumentRepository(prisma);
  const uploadFileUseCase  = new UploadFileUseCase(storageProvider, documentRepository);
  const getFileUrlUseCase  = new GetFileUrlUseCase(storageProvider, documentRepository);

  // ── POST /tickets/:ticketId/documents ────────────────────
  // Upload a file and attach it to a ticket
  // Uses @fastify/multipart to handle file uploads
  // (multipart/form-data is the format browsers use for files)
  app.post('/tickets/:ticketId/documents', {
    preHandler: [authenticate]
  }, async (request, reply) => {

    const { ticketId } = request.params as { ticketId: string };
    const { organizationId } = request.currentUser;

    // Read the uploaded file from the multipart request
    const data = await request.file();

    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    // Convert the file stream to a Buffer
    // Buffer is raw bytes — what S3 expects
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) {
      chunks.push(chunk);
    }
    const buffer    = Buffer.concat(chunks);
    const sizeBytes = buffer.length;

    // Run the upload use-case
    const result = await uploadFileUseCase.execute({
      fileName: data.filename,
      buffer,
      mimeType:  data.mimetype,
      sizeBytes,
      ticketId,
      organizationId,
    });

    if (!result.isSuccess) {
      return reply.status(400).send({ error: result.error });
    }

    return reply.status(201).send(result.value);
  });

  // ── GET /documents/:id/url ───────────────────────────────
  // Get a temporary signed URL to download a file
  // The URL expires after 15 minutes for security
  app.get('/documents/:id/url', {
    preHandler: [authenticate]
  }, async (request, reply) => {

    const { id } = request.params as { id: string };

    const result = await getFileUrlUseCase.execute({ documentId: id });

    if (!result.isSuccess) {
      return reply.status(404).send({ error: result.error });
    }

    return reply.status(200).send(result.value);
  });

  // ── GET /tickets/:ticketId/documents ─────────────────────
  // Get all documents attached to a ticket
  app.get('/tickets/:ticketId/documents', {
    preHandler: [authenticate]
  }, async (request, reply) => {

    const { ticketId } = request.params as { ticketId: string };

    const documents = await documentRepository.findByTicketId(ticketId);

    return reply.status(200).send({
      documents: documents.map(d => d.toJSON())
    });
  });
}