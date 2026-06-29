import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IStorageProvider }    from '../domain/IStorageProvider';
import { IDocumentRepository } from '../domain/IDocumentRepository';

// Input — ID of the document record to generate a URL for
export interface GetFileUrlInput {
  documentId: string;
}

// Output — signed URL, original file name, and expiry duration
export interface GetFileUrlOutput {
  url:       string;
  fileName:  string;
  expiresIn: string;
}

export class GetFileUrlUseCase
  implements UseCase<Result<GetFileUrlOutput>, GetFileUrlInput>
{
  constructor(
    private readonly storageProvider:    IStorageProvider,
    private readonly documentRepository: IDocumentRepository,
  ) {}

  async execute(input: GetFileUrlInput): Promise<Result<GetFileUrlOutput>> {

    // 1 — Load the document record
    const document = await this.documentRepository.findById(input.documentId);
    if (!document) {
      return Result.fail('Document not found');
    }

    // 2 — Generate a signed URL valid for 15 minutes; more secure than a permanent public URL
    const url = await this.storageProvider.getSignedUrl(document.s3Key);

    return Result.ok({
      url,
      fileName:  document.fileName,
      expiresIn: '15 minutes',
    });
  }
}