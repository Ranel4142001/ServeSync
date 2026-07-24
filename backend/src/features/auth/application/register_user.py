from src.features.auth.domain.user_repository import IUserRepository
from src.features.auth.infrastructure.security.hash_service import HashService
from src.features.auth.presentation.schemas import RegisterRequest
from src.shared.infrastructure.models import User
from src.shared.domain.result import Result

class RegisterUserUseCase:
    """
    UseCase to register a new user in the organization.
    Checks for email availability and hashes the user's password.
    """
    def __init__(self, user_repository: IUserRepository, hash_service: HashService) -> None:
        self.user_repository = user_repository
        self.hash_service = hash_service

    def execute(self, req: RegisterRequest) -> Result[User]:
        if self.user_repository.exists_by_email(req.email):
            return Result.fail("A user with this email already exists")

        hashed_password = self.hash_service.hash(req.password)

        new_user = User(
            email=req.email,
            passwordHash=hashed_password,
            firstName=req.firstName,
            lastName=req.lastName,
            role=req.role,
            isActive=True,
            organizationId=req.organizationId
        )

        saved_user = self.user_repository.save(new_user)
        return Result.ok(saved_user)
