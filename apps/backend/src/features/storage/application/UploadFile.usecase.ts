import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Document } from "../domain/Document.entity";
//import { IStorageProvider } from "../domain/IStorageProvider";
import { IDocumentRepository } from "../domain/IDocumentRepository";
import { encodeId } from "@shared/utils/idGenerators";

export interface UploadFileInput {
  fileName: string;
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
  ticketId: string;
  organizationId: string;
}

export interface UploadFileOutput {
  document: ReturnType<Document["toJSON"]>;
}

export class UploadFileUseCase implements UseCase<
  Result<UploadFileOutput>,
  UploadFileInput
> {
  constructor(
    //private readonly storageProvider: IStorageProvider,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(input: UploadFileInput): Promise<Result<UploadFileOutput>> {
    // 1 — Reject unsupported file types
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

    // 2 — Build S3 key using encoded IDs for human-readable path structure
    const timestamp = Date.now();
    const orgLabel = encodeId('org', input.organizationId);
    const ticketLabel = encodeId('ticket', input.ticketId);
    const s3Key = `uploads/${orgLabel}/${ticketLabel}/${timestamp}-${input.fileName}`;

    // // 3 — Upload to storage
    // await this.storageProvider.upload({
    //   key: s3Key,
    //   buffer: input.buffer,
    //   mimeType: input.mimeType,
    //   sizeBytes: input.sizeBytes,
    // });

    // 4 — Create the Document entity with the numeric ticketId
    const document = Document.create({
      fileName: input.fileName,
      s3Key,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      ticketId: input.ticketId,
      createdAt: new Date(),
    });

    // 5 — Persist
    const saved = await this.documentRepository.save(document);

    return Result.ok({ document: saved.toJSON() });
  }
}
