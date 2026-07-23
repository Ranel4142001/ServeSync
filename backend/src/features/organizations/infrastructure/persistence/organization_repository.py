from typing import Optional
from sqlalchemy.orm import Session
from src.features.organizations.domain.organization_repository import IOrganizationRepository
from src.shared.infrastructure.models import Organization

class SqlAlchemyOrganizationRepository(IOrganizationRepository):
    """
    SQLAlchemy implementation of the Organization Repository.
    """
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, id: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.id == id).first()

    def find_by_slug(self, slug: str) -> Optional[Organization]:
        return self.db.query(Organization).filter(Organization.slug == slug).first()

    def save(self, organization: Organization) -> Organization:
        merged = self.db.merge(organization)
        self.db.commit()
        self.db.refresh(merged)
        return merged

    def exists_by_slug(self, slug: str) -> bool:
        return self.db.query(Organization).filter(Organization.slug == slug).count() > 0
