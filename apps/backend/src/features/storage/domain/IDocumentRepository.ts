import { Document } from "./Document.entity";

export interface IDocumentRepository {
  findById(id: string): Promise<Document | null>;
  findByTicketId(ticketId: string): Promise<Document[]>;
  save(document: Document): Promise<Document>;
  delete(id: string): Promise<void>;
}