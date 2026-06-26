import { UseCase } from '@shared/application/UseCase';
import { Result }  from '@shared/domain/Result';
import { IUserRepository } from '../domain/IUserRepository';
import { IHashService }    from '../domain/IHashService';
import { ITokenService }   from '../domain/ITokenService';

// ── Input ────────────────────────────────────────────────
export interface LoginUserInput {
  email:    string;
  password: string;  // plain text — compared against hash
}

// ── Output ───────────────────────────────────────────────
export interface LoginUserOutput {
  accessToken: string;  // JWT the client stores and sends with every request
  user: {
    id:             string;
    email:          string;
    fullName:       string;
    role:           string;
    organizationId: string;
  };
}

// ── Use-case ─────────────────────────────────────────────
export class LoginUserUseCase
  implements UseCase<Result<LoginUserOutput>, LoginUserInput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService:    IHashService,
    private readonly tokenService:   ITokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {

    // Step 1 — Find user by email
    const user = await this.userRepository.findByEmail(input.email);

    // Intentionally vague error — never tell the caller
    // whether the email or password was wrong (security)
    if (!user) {
      return Result.fail('Invalid email or password');
    }

    // Step 2 — Check if account is active
    if (!user.isActive) {
      return Result.fail('This account has been deactivated');
    }

    // Step 3 — Compare provided password against stored hash
    const passwordMatch = await this.hashService.compare(
      input.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return Result.fail('Invalid email or password'); // same vague message
    }

    // Step 4 — Sign a JWT token with the user's key info
    const accessToken = this.tokenService.sign({
      userId:         user.id,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
    });

    // Step 5 — Return the token + safe user info
    return Result.ok({
      accessToken,
      user: {
        id:             user.id,
        email:          user.email,
        fullName:       user.fullName,
        role:           user.role,
        organizationId: user.organizationId,
      }
    });
  }
}