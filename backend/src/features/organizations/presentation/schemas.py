from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class CreateOrganizationRequest(BaseModel):
    name: str = Field(min_length=1)
    slug: Optional[str] = None

class CreateOrganizationResponse(BaseModel):
    message: str
    id: str
    name: str
    slug: str

class OrganizationResponse(BaseModel):
    id: str
    code: Optional[str] = None
    name: str
    slug: str
    createdAt: datetime

class UpdateOrganizationRequest(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None

class UpdateOrganizationResponse(BaseModel):
    id: str
    code: str
    name: str
    slug: str
    createdAt: datetime
