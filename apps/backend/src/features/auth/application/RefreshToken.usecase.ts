import { UseCase }       from '@shared/application/UseCase';
import { Result }        from '@shared/domain/Result';
import { IUserRepository } from '../domain/IUserRepository';
import { ITokenService }   from '../domain/ITokenService';

// ── Input ────────────────────────────────────────────────
export interface RefreshTokenInput {
  token: string;  // the existing JWT sent by the client
}

// ── Output ───────────────────────────────────────────────
export interface RefreshTokenOutput {
  accessToken: string;  // a brand new JWT with a fresh expiry
}

// ── Use-case ─────────────────────────────────────────────
export class RefreshTokenUseCase
  implements UseCase<Result<RefreshTokenOutput>, RefreshTokenInput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService:   ITokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<Result<RefreshTokenOutput>> {

    // Step 1 — Verify the existing token is valid and not expired
    const payload = this.tokenService.verify(input.token);
    if (!payload) {
      return Result.fail('Invalid or expired token');
    }

    // Step 2 — Make sure the user still exists and is still active
    // (they could have been deactivated since the token was issued)
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      return Result.fail('User not found or deactivated');
    }

    // Step 3 — Issue a brand new token with fresh expiry
    const accessToken = this.tokenService.sign({
      userId:         user.id,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
    });

    return Result.ok({ accessToken });
  }
}