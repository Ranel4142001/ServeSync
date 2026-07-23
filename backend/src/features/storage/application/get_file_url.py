from src.features.storage.domain.storage_provider import IStorageProvider
from src.features.storage.domain.document_repository import IDocumentRepository
from src.shared.domain.result import Result

class GetFileUrlUseCase:
    """
    UseCase to resolve a temporary signed download URL for a document.
    """
    def __init__(self, storage_provider: IStorageProvider, document_repository: IDocumentRepository) -> None:
        self.storage_provider = storage_provider
        self.document_repository = document_repository

    def execute(self, document_id: str) -> Result[dict]:
        document = self.document_repository.find_by_id(document_id)
        if not document:
            return Result.fail("Document not found")

        signed_url = self.storage_provider.get_signed_url(document.s3Key)
        return Result.ok({
            "url": signed_url,
            "fileName": document.fileName,
            "expiresIn": "15 minutes"
        })
