import re
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from src.database import get_db
from src.features.organizations.infrastructure.persistence.organization_repository import SqlAlchemyOrganizationRepository
from src.features.organizations.application.create_organization import CreateOrganizationUseCase
from src.features.organizations.presentation.schemas import (
    CreateOrganizationRequest, CreateOrganizationResponse,
    OrganizationResponse, UpdateOrganizationRequest, UpdateOrganizationResponse
)
from src.features.auth.presentation.dependencies import get_current_user, CurrentUser, RequireRole
from src.shared.infrastructure.models import UserRole, Organization

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("", response_model=CreateOrganizationResponse, status_code=status.HTTP_201_CREATED)
def create_organization(req: CreateOrganizationRequest, db: Session = Depends(get_db)):
    org_repo = SqlAlchemyOrganizationRepository(db)
    use_case = CreateOrganizationUseCase(org_repo)
    
    result = use_case.execute(req)
    if not result.is_success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.error)
        
    org = result.value
    return CreateOrganizationResponse(
        message="Organization created successfully",
        id=org.id,
        name=org.name,
        slug=org.slug
    )

@router.get("/{id}", response_model=OrganizationResponse)
def get_organization(id: str, db: Session = Depends(get_db)):
    org_repo = SqlAlchemyOrganizationRepository(db)
    org = org_repo.find_by_id(id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
    return OrganizationResponse(
        id=org.id,
        code=org.code or org.id,
        name=org.name,
        slug=org.slug,
        createdAt=org.createdAt
    )

@router.patch("/{id}", response_model=UpdateOrganizationResponse)
def update_organization(
    id: str,
    req: UpdateOrganizationRequest,
    current_user: CurrentUser = Depends(RequireRole(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    org_repo = SqlAlchemyOrganizationRepository(db)
    org = org_repo.find_by_id(id)
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Organization not found")
        
    if req.slug:
        slug_regex = re.compile(r"^[a-z0-9-]+$")
        if not slug_regex.match(req.slug):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Slug must only contain lowercase letters, numbers, and hyphens"
            )
            
    # Apply updates
    if req.name is not None:
        org.name = req.name
    if req.slug is not None:
        # Check if slug is taken by another organization
        existing = org_repo.find_by_slug(req.slug)
        if existing and existing.id != org.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Slug '{req.slug}' is already taken"
            )
        org.slug = req.slug
        
    db.commit()
    db.refresh(org)
    
    return UpdateOrganizationResponse(
        id=org.id,
        code=org.code or org.id,
        name=org.name,
        slug=org.slug,
        createdAt=org.createdAt
    )
