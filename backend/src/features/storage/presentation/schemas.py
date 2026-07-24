from pydantic import BaseModel
from datetime import datetime
from typing import List

class UploadResponseItem(BaseModel):
    id: str
    fileName: str
    mimeType: str
    sizeBytes: float
    createdAt: datetime

class GetFileUrlResponse(BaseModel):
    url: str
    fileName: str
    expiresIn: str

class DocumentsListResponse(BaseModel):
    documents: List[UploadResponseItem]
