from src.features.auth.domain.user_repository import IUserRepository
from src.features.auth.infrastructure.security.hash_service import HashService
from src.features.auth.infrastructure.security.jwt_service import JwtService
from src.features.auth.presentation.schemas import LoginRequest, LoginResponse, UserSessionInfo
from src.shared.domain.result import Result

class LoginUserUseCase:
    """
    UseCase to authenticate a user using email and password.
    Validates isActive state, hashes matching, and issues JWT token.
    """
    def __init__(
        self, 
        user_repository: IUserRepository, 
        hash_service: HashService, 
        jwt_service: JwtService
    ) -> None:
        self.user_repository = user_repository
        self.hash_service = hash_service
        self.jwt_service = jwt_service

    def execute(self, req: LoginRequest) -> Result[LoginResponse]:
        user = self.user_repository.find_by_email(req.email)
        if not user:
            return Result.fail("Invalid email or password")

        if not user.isActive:
            return Result.fail("This account has been deactivated")

        if not self.hash_service.compare(req.password, user.passwordHash):
            return Result.fail("Invalid email or password")

        payload = {
            "userId": user.id,
            "email": user.email,
            "role": user.role.value,
            "organizationId": user.organizationId
        }
        access_token = self.jwt_service.sign(payload)

        session_info = UserSessionInfo(
            id=user.id,
            email=user.email,
            fullName=user.fullName,
            role=user.role.value,
            organizationId=user.organizationId
        )

        return Result.ok(LoginResponse(accessToken=access_token, user=session_info))
