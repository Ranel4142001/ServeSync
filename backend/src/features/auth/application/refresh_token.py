from src.features.auth.domain.user_repository import IUserRepository
from src.features.auth.infrastructure.security.jwt_service import JwtService
from src.features.auth.presentation.schemas import RefreshRequest, RefreshResponse
from src.shared.domain.result import Result

class RefreshTokenUseCase:
    """
    UseCase to issue a fresh access token using an active JWT token.
    Enforces user existence and active status.
    """
    def __init__(self, user_repository: IUserRepository, jwt_service: JwtService) -> None:
        self.user_repository = user_repository
        self.jwt_service = jwt_service

    def execute(self, req: RefreshRequest) -> Result[RefreshResponse]:
        payload = self.jwt_service.verify(req.token)
        if not payload:
            return Result.fail("Invalid or expired token")

        user_id = payload.get("userId")
        if not user_id:
            return Result.fail("Invalid token payload")

        user = self.user_repository.find_by_id(user_id)
        if not user or not user.isActive:
            return Result.fail("User not found or deactivated")

        new_payload = {
            "userId": user.id,
            "email": user.email,
            "role": user.role.value,
            "organizationId": user.organizationId
        }
        new_token = self.jwt_service.sign(new_payload)

        return Result.ok(RefreshResponse(accessToken=new_token))
