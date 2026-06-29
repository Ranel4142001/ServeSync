import { UseCase } from '@shared/application/UseCase';
import { Result }  from '@shared/domain/Result';
import { IUserRepository } from '../domain/IUserRepository';
import { IHashService }    from '../domain/IHashService';
import { ITokenService }   from '../domain/ITokenService';

// Input — plain-text password is compared against the stored hash
export interface LoginUserInput {
  email:    string;
  password: string;
}

// Output — JWT access token and minimal user info
export interface LoginUserOutput {
  accessToken: string;
  user: {
    id:             string;
    email:          string;
    fullName:       string;
    role:           string;
    organizationId: string;
  };
}

export class LoginUserUseCase
  implements UseCase<Result<LoginUserOutput>, LoginUserInput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService:    IHashService,
    private readonly tokenService:   ITokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {

    // 1 — Find user by email; keep error vague to avoid leaking which field was wrong
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return Result.fail('Invalid email or password');
    }

    // 2 — Reject deactivated accounts before checking the password
    if (!user.isActive) {
      return Result.fail('This account has been deactivated');
    }

    // 3 — Compare provided password against stored hash
    const passwordMatch = await this.hashService.compare(
      input.password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return Result.fail('Invalid email or password');
    }

    // 4 — Sign a JWT with the user's key claims
    const accessToken = this.tokenService.sign({
      userId:         user.id,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
    });

    // 5 — Return the token and safe user info
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