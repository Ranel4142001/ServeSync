import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Document } from "../domain/Document.entity";
import { IStorageProvider } from "../domain/IStorageProvider";
import { IDocumentRepository } from "../domain/IDocumentRepository";

// Input — file bytes and metadata, plus the ticket and organization to attach to
export interface UploadFileInput {
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  ticketId: string;
  organizationId: string;
}

// Output — the saved document record
export interface UploadFileOutput {
  document: ReturnType<Document["toJSON"]>;
}

export class UploadFileUseCase implements UseCase<
  Result<UploadFileOutput>,
  UploadFileInput
> {
  constructor(
    private readonly storageProvider: IStorageProvider,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(input: UploadFileInput): Promise<Result<UploadFileOutput>> {
    // 1 — Reject unsupported file types; only JPEG, PNG, GIF, and PDF are allowed
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];

    if (!allowedTypes.includes(input.mimeType)) {
      return Result.fail(
        "Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed",
      );
    }

    // 2 — Build a unique S3 key: uploads/{organizationId}/{ticketId}/{timestamp}-{fileName}
    const timestamp = Date.now();
    const s3Key = `uploads/${input.organizationId}/${input.ticketId}/${timestamp}-${input.fileName}`;

    // 3 — Upload the file to S3
    await this.storageProvider.upload({
      key: s3Key,
      buffer: input.buffer,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
    });

    // 4 — Create the Document entity; throws if file size or name is invalid
    const document = Document.create({
      fileName: input.fileName,
      s3Key,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      ticketId: input.ticketId,
      createdAt: new Date(),
    });

    // 5 — Persist the document record and return it
    const saved = await this.documentRepository.save(document);

    return Result.ok({ document: saved.toJSON() });
  }
}
