import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { IUserRepository } from "../domain/IUserRepository";
import { ITokenService } from "../domain/ITokenService";

export interface RefreshTokenInput {
  token: string;
}

export interface RefreshTokenOutput {
  accessToken: string;
}

export class RefreshTokenUseCase implements UseCase<
  Result<RefreshTokenOutput>,
  RefreshTokenInput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<Result<RefreshTokenOutput>> {
    // 1 — Verify the token; payload now contains numeric IDs
    const payload = this.tokenService.verify(input.token);
    if (!payload) {
      return Result.fail("Invalid or expired token");
    }

    // 2 — Confirm the user exists
    const user = await this.userRepository.findById(payload.userId);
    if (!user || !user.isActive) {
      return Result.fail("User not found or deactivated");
    }

    // 3 — Sign and return
    const accessToken = this.tokenService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return Result.ok({ accessToken });
  }
}
