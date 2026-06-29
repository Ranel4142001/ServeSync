import { Document } from "./Document.entity";

// Contract for document metadata persistence — S3 stores the file bytes, the DB stores the metadata
export interface IDocumentRepository {
  // Find a document record by ID
  findById(id: string): Promise<Document | null>;

  // Find all documents attached to a ticket
  findByTicketId(ticketId: string): Promise<Document[]>;

  // Save a new document record
  save(document: Document): Promise<Document>;

  // Delete a document record
  delete(id: string): Promise<void>;
}
