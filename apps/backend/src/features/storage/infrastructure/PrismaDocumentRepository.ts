import { ExtendedPrismaClient } from "@shared/infrastructure/PrismaClient";
import { IDocumentRepository } from "../domain/IDocumentRepository";
import { Document } from "../domain/Document.entity";

export class PrismaDocumentRepository implements IDocumentRepository {
  constructor(private readonly prisma: ExtendedPrismaClient) {}

  // Maps a raw Prisma row to a Document entity
  private toEntity(raw: any): Document {
    return Document.create(
      {
        fileName: raw.fileName,
        s3Key: raw.s3Key,
        mimeType: raw.mimeType,
        sizeBytes: raw.sizeBytes,
        ticketId: raw.ticketId, // Number
        createdAt: raw.createdAt,
      },
      raw.id, // Number
    );
  }

  async findById(id: number): Promise<Document | null> {
    const raw = await this.prisma.document.findUnique({ where: { id } });
    if (!raw) return null;
    return this.toEntity(raw);
  }

  async findByTicketId(ticketId: number): Promise<Document[]> {
    const rows = await this.prisma.document.findMany({
      where: { ticketId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => this.toEntity(row));
  }

  async save(document: Document): Promise<Document> {
    // If id exists and is > 0, perform an update
    if (document.id && document.id > 0) {
      const raw = await this.prisma.document.update({
        where: { id: document.id },
        data: {
          fileName: document.fileName,
          s3Key: document.s3Key,
          mimeType: document.mimeType,
          sizeBytes: document.sizeBytes,
          ticketId: document.ticketId,
        },
      });
      return this.toEntity(raw);
    }

    // Otherwise, create a new record
    const raw = await this.prisma.document.create({
      data: {
        fileName: document.fileName,
        s3Key: document.s3Key,
        mimeType: document.mimeType,
        sizeBytes: document.sizeBytes,
        ticketId: document.ticketId,
        createdAt: document.createdAt,
      },
    });
    return this.toEntity(raw);
  }

  async delete(id: number): Promise<void> {
    await this.prisma.document.delete({ where: { id } });
  }
}
