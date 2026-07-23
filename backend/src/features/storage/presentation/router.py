import pathlib
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.storage.infrastructure.persistence.document_repository import SqlAlchemyDocumentRepository
from src.features.storage.infrastructure.providers.s3_storage_provider import S3StorageProvider
from src.features.storage.application.upload_file import UploadFileUseCase
from src.features.storage.application.get_file_url import GetFileUrlUseCase
from src.features.storage.presentation.schemas import (
    UploadResponseItem, GetFileUrlResponse, DocumentsListResponse
)
from src.features.auth.presentation.dependencies import get_current_user, CurrentUser

router = APIRouter(tags=["Storage"])

@router.post("/tickets/{ticketId}/documents", response_model=UploadResponseItem, status_code=status.HTTP_201_CREATED)
async def upload_document(
    ticketId: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc_repo = SqlAlchemyDocumentRepository(db)
    storage_provider = S3StorageProvider()
    use_case = UploadFileUseCase(doc_repo)
    
    file_bytes = await file.read()
    size_bytes = len(file_bytes)
    
    result = use_case.execute(
        file_name=file.filename or "unnamed_file",
        mime_type=file.content_type or "application/octet-stream",
        size_bytes=size_bytes,
        ticket_id=ticketId,
        organization_id=current_user.organizationId
    )
    
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    doc = result.value
    
    # Store the actual file via S3 / local system
    storage_provider.upload(
        key=doc.s3Key,
        file_bytes=file_bytes,
        mime_type=doc.mimeType,
        size_bytes=size_bytes
    )
    
    return UploadResponseItem(
        id=doc.id,
        fileName=doc.fileName,
        mimeType=doc.mimeType,
        sizeBytes=doc.sizeBytes,
        createdAt=doc.createdAt
    )

@router.get("/documents/{id}/url", response_model=GetFileUrlResponse)
def get_document_url(
    id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc_repo = SqlAlchemyDocumentRepository(db)
    storage_provider = S3StorageProvider()
    use_case = GetFileUrlUseCase(storage_provider, doc_repo)
    
    result = use_case.execute(id)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=result.error)
        
    return GetFileUrlResponse(
        url=result.value["url"],
        fileName=result.value["fileName"],
        expiresIn=result.value["expiresIn"]
    )

@router.get("/tickets/{ticketId}/documents", response_model=DocumentsListResponse)
def list_ticket_documents(
    ticketId: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    doc_repo = SqlAlchemyDocumentRepository(db)
    documents = doc_repo.find_by_ticket_id(ticketId)
    
    items = [
        UploadResponseItem(
            id=d.id,
            fileName=d.fileName,
            mimeType=d.mimeType,
            sizeBytes=d.sizeBytes,
            createdAt=d.createdAt
        )
        for d in documents
    ]
    return DocumentsListResponse(documents=items)

# Endpoint for local storage download simulation
@router.get("/documents/download/{safe_filename}", include_in_schema=False)
def download_local_file(safe_filename: str):
    file_path = pathlib.Path("uploads") / safe_filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)
