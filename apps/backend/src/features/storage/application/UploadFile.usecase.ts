import { UseCase }    from '@shared/application/UseCase';
import { Result }     from '@shared/domain/Result';
import { Document }   from '../domain/Document.entity';
import { IStorageProvider } from '../domain/IStorageProvider';
import { IDocumentRepository } from '../domain/IDocumentRepository';

// ── Input ────────────────────────────────────────────────
export interface UploadFileInput {
  fileName:       string; // original file name from the user
  buffer:         Buffer; // raw file bytes
  mimeType:       string; // file type
  sizeBytes:      number; // file size
  ticketId:       string; // which ticket to attach this to
  organizationId: string; // used to organize files in S3
}

// ── Output ───────────────────────────────────────────────
export interface UploadFileOutput {
  document: ReturnType<Document['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class UploadFileUseCase
  implements UseCase<Result<UploadFileOutput>, UploadFileInput>
{
  constructor(
    // Two dependencies — storage for S3, repository for DB
    private readonly storageProvider:     IStorageProvider,
    private readonly documentRepository:  IDocumentRepository,
  ) {}

  async execute(input: UploadFileInput): Promise<Result<UploadFileOutput>> {

    // Step 1 — Define the allowed file types
    // We only accept images and PDFs for security
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];

    if (!allowedTypes.includes(input.mimeType)) {
      return Result.fail(
        'Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed'
      );
    }

    // Step 2 — Generate a unique S3 key for this file
    // Format: uploads/{organizationId}/{ticketId}/{timestamp}-{fileName}
    // The timestamp prefix ensures no two files ever have the same key
    // even if they have the same name
    const timestamp = Date.now();
    const s3Key = `uploads/${input.organizationId}/${input.ticketId}/${timestamp}-${input.fileName}`;

    // Step 3 — Upload the file to S3
    // storageProvider handles the actual AWS API call
    await this.storageProvider.upload({
      key:       s3Key,
      buffer:    input.buffer,
      mimeType:  input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    // Step 4 — Create the Document entity
    // This validates file size, name, etc.
    const document = Document.create({
      fileName:  input.fileName,
      s3Key,
      mimeType:  input.mimeType,
      sizeBytes: input.sizeBytes,
      ticketId:  input.ticketId,
      createdAt: new Date(),
    });

    // Step 5 — Save document record to database
    // We store the s3Key so we can retrieve the file later
    const saved = await this.documentRepository.save(document);

    return Result.ok({ document: saved.toJSON() });
  }
}