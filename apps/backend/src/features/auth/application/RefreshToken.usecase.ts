import { UseCase }       from '@shared/application/UseCase';
import { Result }        from '@shared/domain/Result';
import { IUserRepository } from '../domain/IUserRepository';
import { ITokenService }   from '../domain/ITokenService';

// Input — existing JWT sent by the client to be refreshed
export interface RefreshTokenInput {
  token: string;
}

// Output — new JWT with a fresh expiry
export interface RefreshTokenOutput {
  accessToken: string;
}

export class RefreshTokenUseCase
  implements UseCase<Result<RefreshTokenOutput>, RefreshTokenInput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService:   ITokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<Result<RefreshTokenOutput>> {

    // 1 — Verify the token is valid and not expired
    const payload = this.tokenService.verify(input.token);
    if (!payload) {
      return Result.fail('Invalid or expired token');
    }

    // 2 — Confirm the user still exists and is active; they may have been deactivated since token was issued
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      return Result.fail('User not found or deactivated');
    }

    // 3 — Sign and return a new token with fresh expiry
    const accessToken = this.tokenService.sign({
      userId:         user.id,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
    });

    return Result.ok({ accessToken });
  }
}