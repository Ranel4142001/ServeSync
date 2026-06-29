import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IStorageProvider }    from '../domain/IStorageProvider';
import { IDocumentRepository } from '../domain/IDocumentRepository';

// ── Input ────────────────────────────────────────────────
export interface GetFileUrlInput {
  documentId: string; // the document record in our database
}

// ── Output ───────────────────────────────────────────────
export interface GetFileUrlOutput {
  url:      string; // temporary signed URL to download the file
  fileName: string; // original file name for the download
  expiresIn: string; // how long the URL is valid
}

// ── Use-case ─────────────────────────────────────────────
export class GetFileUrlUseCase
  implements UseCase<Result<GetFileUrlOutput>, GetFileUrlInput>
{
  constructor(
    private readonly storageProvider:    IStorageProvider,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(input: GetFileUrlInput): Promise<Result<GetFileUrlOutput>> {

    // Step 1 — Find the document record in the database
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      return Result.fail('Document not found');
    }

    // Step 2 — Ask S3 for a temporary signed URL
    // This URL is valid for 15 minutes
    // After that it expires and the file cannot be accessed
    // This is much more secure than a permanent public URL
    const url = await this.storageProvider.getSignedUrl(document.s3Key);

    return Result.ok({
      url,
      fileName:  document.fileName,
      expiresIn: '15 minutes',
    });
  }
}