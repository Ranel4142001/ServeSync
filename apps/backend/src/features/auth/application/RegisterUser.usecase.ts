import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { User } from "../domain/User.entity";
import { Role } from "../domain/Role.enum";
import { IUserRepository } from "../domain/IUserRepository";
import { IHashService } from "../domain/IHashService";
import { decodeId } from "@shared/utils/idGenerators"; // Added utility

export interface RegisterUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: string; // Provided as string from API
}

export interface RegisterUserOutput {
  user: ReturnType<User["toJSON"]>;
}

export class RegisterUserUseCase implements UseCase<
  Result<RegisterUserOutput>,
  RegisterUserInput
> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {
    const emailTaken = await this.userRepository.existsByEmail(input.email);
    if (emailTaken) {
      return Result.fail("A user with this email already exists");
    }

    const passwordHash = await this.hashService.hash(input.password);

    // Decode external string ID to internal numeric ID
    const numericOrgId = decodeId(input.organizationId);

    const user = User.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
      isActive: true,
      organizationId: numericOrgId, // Now numeric
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await this.userRepository.save(user);

    return Result.ok({ user: saved.toJSON() });
  }
}
