from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from src.features.auth.infrastructure.security.jwt_service import JwtService
from src.shared.infrastructure.models import UserRole

# HTTPBearer extracts Authorization: Bearer <token> automatically
security = HTTPBearer()

class CurrentUser(BaseModel):
    userId: str
    email: str
    role: str
    organizationId: str

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> CurrentUser:
    """
    Dependency that extracts the JWT token, verifies it, and returns
    the validated CurrentUser object.
    """
    token = credentials.credentials
    jwt_service = JwtService()
    payload = jwt_service.verify(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
    
    return CurrentUser(
        userId=payload["userId"],
        email=payload["email"],
        role=payload["role"],
        organizationId=payload["organizationId"]
    )

class RequireRole:
    """
    Role-Based Access Control (RBAC) dependency factory.
    Verifies that the authenticated user possesses one of the allowed roles.
    """
    def __init__(self, *allowed_roles: UserRole) -> None:
        self.allowed_roles = [r.value for r in allowed_roles]

    def __call__(self, current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Forbidden: insufficient permissions"
            )
        return current_user
