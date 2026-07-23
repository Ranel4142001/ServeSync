import re
from src.features.organizations.domain.organization_repository import IOrganizationRepository
from src.features.organizations.presentation.schemas import CreateOrganizationRequest
from src.shared.infrastructure.models import Organization
from src.shared.domain.result import Result

def generate_slug(name: str) -> str:
    """Helper to generate a URL-friendly slug from an organization name."""
    slug = name.lower()
    # Remove non-alphanumeric characters except spaces and hyphens
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces and multiple hyphens with a single hyphen
    slug = re.sub(r'[\s-]+', '-', slug)
    return slug.strip('-')

class CreateOrganizationUseCase:
    """
    UseCase to register a new Organization.
    Generates slugs if not provided and checks for slug collisions.
    """
    def __init__(self, organization_repository: IOrganizationRepository) -> None:
        self.organization_repository = organization_repository

    def execute(self, req: CreateOrganizationRequest) -> Result[Organization]:
        slug = req.slug if req.slug else generate_slug(req.name)

        if self.organization_repository.exists_by_slug(slug):
            return Result.fail(f'Slug "{slug}" is already taken. Please choose a different name.')

        new_org = Organization(
            name=req.name,
            slug=slug
        )

        saved = self.organization_repository.save(new_org)
        
        # Make sure code is set (it mirrors id as its publicId)
        if not saved.code:
            saved.code = saved.id
            self.organization_repository.save(saved)

        return Result.ok(saved)
