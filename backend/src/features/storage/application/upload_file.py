import time
from src.features.storage.domain.document_repository import IDocumentRepository
from src.shared.infrastructure.models import Document
from src.shared.domain.result import Result

class UploadFileUseCase:
    """
    UseCase to validate and register an uploaded document attachment.
    """
    def __init__(self, document_repository: IDocumentRepository) -> None:
        self.document_repository = document_repository

    def execute(
        self, 
        file_name: str, 
        mime_type: str, 
        size_bytes: int, 
        ticket_id: str, 
        organization_id: str
    ) -> Result[Document]:
        # 1 — Reject unsupported types
        allowed_types = ["image/jpeg", "image/png", "image/gif", "application/pdf"]
        if mime_type not in allowed_types:
            return Result.fail("Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed")

        # 2 — Construct S3 Key format e.g. "uploads/org_id/ticket_id/timestamp-filename"
        timestamp = int(time.time() * 1000)
        s3_key = f"uploads/{organization_id}/{ticket_id}/{timestamp}-{file_name}"

        # 3 — Create and persist database document record
        document = Document(
            fileName=file_name,
            s3Key=s3_key,
            mimeType=mime_type,
            sizeBytes=float(size_bytes),
            ticketId=ticket_id
        )

        saved = self.document_repository.save(document)
        return Result.ok(saved)
