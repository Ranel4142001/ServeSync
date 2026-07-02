import { Document } from "./Document.entity";

export interface IDocumentRepository {
  findById(id: number): Promise<Document | null>;
  findByTicketId(ticketId: number): Promise<Document[]>;
  save(document: Document): Promise<Document>;
  delete(id: number): Promise<void>;
}