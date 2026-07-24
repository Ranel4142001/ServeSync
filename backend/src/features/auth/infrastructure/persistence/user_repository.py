from typing import List, Optional
from sqlalchemy.orm import Session
from src.features.auth.domain.user_repository import IUserRepository
from src.shared.infrastructure.models import User

class SqlAlchemyUserRepository(IUserRepository):
    """
    SQLAlchemy implementation of the User Repository.
    Executes raw database actions using the ORM.
    """
    def __init__(self, db: Session) -> None:
        self.db = db

    def find_by_id(self, id: str) -> Optional[User]:
        return self.db.query(User).filter(User.id == id).first()

    def find_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def find_by_organization_id(self, organization_id: str) -> List[User]:
        return self.db.query(User).filter(User.organizationId == organization_id).all()

    def save(self, user: User) -> User:
        # Merge handles both insert and update (upsert behavior)
        merged = self.db.merge(user)
        self.db.commit()
        self.db.refresh(merged)
        return merged

    def delete(self, id: str) -> None:
        user = self.find_by_id(id)
        if user:
            self.db.delete(user)
            self.db.commit()

    def exists_by_email(self, email: str) -> bool:
        return self.db.query(User).filter(User.email == email).count() > 0
