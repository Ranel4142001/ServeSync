from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import List, Optional
from src.shared.infrastructure.models import UserRole

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    firstName: str
    lastName: str
    role: UserRole = UserRole.CLIENT
    organizationId: str

class RegisterResponse(BaseModel):
    message: str
    id: str
    email: str
    fullName: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserSessionInfo(BaseModel):
    id: str
    email: str
    fullName: str
    role: str
    organizationId: str

class LoginResponse(BaseModel):
    accessToken: str
    user: UserSessionInfo

class RefreshRequest(BaseModel):
    token: str

class RefreshResponse(BaseModel):
    accessToken: str

class UserMeResponse(BaseModel):
    user: UserSessionInfo

class UserItem(BaseModel):
    id: str
    email: str
    fullName: str
    role: str
    isActive: bool
    createdAt: datetime
    ticketsCount: int

class UsersListResponse(BaseModel):
    users: List[UserItem]
    total: int
