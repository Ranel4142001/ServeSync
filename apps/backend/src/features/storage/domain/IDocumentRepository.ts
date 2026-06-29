import { Document } from './Document.entity';

// Contract for saving and retrieving document records
// from the database — separate from the actual file storage
// Database stores the METADATA (name, size, s3Key)
// S3 stores the actual FILE BYTES
export interface IDocumentRepository {

  // Find a document record by its ID
  findById(id: string): Promise<Document | null>;

  // Find all documents attached to a specific ticket
  findByTicketId(ticketId: string): Promise<Document[]>;

  // Save a new document record
  save(document: Document): Promise<Document>;

  // Delete a document record from the database
  delete(id: string): Promise<void>;
}