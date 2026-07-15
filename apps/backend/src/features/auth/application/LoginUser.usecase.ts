import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { IUserRepository } from "../domain/IUserRepository";
import { IHashService } from "../domain/IHashService";
import { ITokenService } from "../domain/ITokenService";

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    organizationId: string;
  };
}

export class LoginUserUseCase implements UseCase<
  Result<LoginUserOutput>,
  LoginUserInput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: LoginUserInput): Promise<Result<LoginUserOutput>> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      return Result.fail("Invalid email or password");
    }

    if (!user.isActive) {
      return Result.fail("This account has been deactivated");
    }

    const passwordMatch = await this.hashService.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatch) {
      return Result.fail("Invalid email or password");
    }

    const accessToken = this.tokenService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    });

    return Result.ok({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
      },
    });
  }
}
