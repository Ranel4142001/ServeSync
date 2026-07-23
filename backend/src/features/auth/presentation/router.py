from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.auth.infrastructure.persistence.user_repository import SqlAlchemyUserRepository
from src.features.auth.infrastructure.security.hash_service import HashService
from src.features.auth.infrastructure.security.jwt_service import JwtService
from src.features.auth.application.register_user import RegisterUserUseCase
from src.features.auth.application.login_user import LoginUserUseCase
from src.features.auth.application.refresh_token import RefreshTokenUseCase
from src.features.auth.presentation.schemas import (
    RegisterRequest, RegisterResponse,
    LoginRequest, LoginResponse,
    RefreshRequest, RefreshResponse,
    UserMeResponse, UsersListResponse, UserItem, UserSessionInfo
)
from src.features.auth.presentation.dependencies import get_current_user, CurrentUser, RequireRole
from src.shared.infrastructure.models import UserRole, Ticket

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    user_repo = SqlAlchemyUserRepository(db)
    hash_service = HashService()
    use_case = RegisterUserUseCase(user_repo, hash_service)
    
    result = use_case.execute(req)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    user = result.value
    return RegisterResponse(
        message="Account created successfully",
        id=user.id,
        email=user.email,
        fullName=user.fullName,
        role=user.role.value
    )

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user_repo = SqlAlchemyUserRepository(db)
    hash_service = HashService()
    jwt_service = JwtService()
    use_case = LoginUserUseCase(user_repo, hash_service, jwt_service)
    
    result = use_case.execute(req)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=result.error)
        
    return result.value

@router.post("/refresh", response_model=RefreshResponse)
def refresh(req: RefreshRequest, db: Session = Depends(get_db)):
    user_repo = SqlAlchemyUserRepository(db)
    jwt_service = JwtService()
    use_case = RefreshTokenUseCase(user_repo, jwt_service)
    
    result = use_case.execute(req)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=result.error)
        
    return result.value

@router.get("/me", response_model=UserMeResponse)
def me(current_user: CurrentUser = Depends(get_current_user), db: Session = Depends(get_db)):
    user_repo = SqlAlchemyUserRepository(db)
    user = user_repo.find_by_id(current_user.userId)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    session_info = UserSessionInfo(
        id=user.id,
        email=user.email,
        fullName=user.fullName,
        role=user.role.value,
        organizationId=user.organizationId
    )
    return UserMeResponse(user=session_info)

@router.get("/users", response_model=UsersListResponse)
def get_users(
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    user_repo = SqlAlchemyUserRepository(db)
    users = user_repo.find_by_organization_id(current_user.organizationId)
    
    # Calculate ticket counts per user
    tickets = db.query(Ticket.agentId, Ticket.clientId).filter(
        Ticket.organizationId == current_user.organizationId
    ).all()
    
    ticket_counts = {}
    for agent_id, client_id in tickets:
        if agent_id:
            ticket_counts[agent_id] = ticket_counts.get(agent_id, 0) + 1
        if client_id:
            ticket_counts[client_id] = ticket_counts.get(client_id, 0) + 1
            
    users_items = [
        UserItem(
            id=u.id,
            email=u.email,
            fullName=u.fullName,
            role=u.role.value,
            isActive=u.isActive,
            createdAt=u.createdAt,
            ticketsCount=ticket_counts.get(u.id, 0)
        )
        for u in users
    ]
    
    return UsersListResponse(users=users_items, total=len(users_items))
