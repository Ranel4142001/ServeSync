import { PrismaClient }        from '@prisma/client';
import { IDocumentRepository } from '../domain/IDocumentRepository';
import { Document }            from '../domain/Document.entity';

export class PrismaDocumentRepository implements IDocumentRepository {

  constructor(private readonly prisma: PrismaClient) {}

  // Maps a raw Prisma row to a Document entity — only place that knows Prisma's document shape
  private toEntity(raw: any): Document {
    return Document.create(
      {
        fileName:  raw.fileName,
        s3Key:     raw.s3Key,
        mimeType:  raw.mimeType,
        sizeBytes: raw.sizeBytes,
        ticketId:  raw.ticketId,
        createdAt: raw.createdAt,
      },
      raw.id
    );
  }

  async findById(id: string): Promise<Document | null> {
    const raw = await this.prisma.document.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByTicketId(ticketId: string): Promise<Document[]> {
    const rows = await this.prisma.document.findMany({
      where:   { ticketId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(row => this.toEntity(row));
  }

  async save(document: Document): Promise<Document> {
    const raw = await this.prisma.document.create({
      data: {
        fileName:  document.fileName,
        s3Key:     document.s3Key,
        mimeType:  document.mimeType,
        sizeBytes: document.sizeBytes,
        ticketId:  document.ticketId,
        createdAt: document.createdAt,
      }
    });
    return this.toEntity(raw);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}