import { UseCase } from '@shared/application/UseCase';
import { Result }  from '@shared/domain/Result';
import { User }    from '../domain/User.entity';
import { Role }    from '../domain/Role.enum';
import { IUserRepository } from '../domain/IUserRepository';
import { IHashService }    from '../domain/IHashService';

// Input — plain-text password is hashed before storage
export interface RegisterUserInput {
  email:          string;
  password:       string;
  firstName:      string;
  lastName:       string;
  role:           Role;
  organizationId: string;
}

// Output — serialized user returned on success
export interface RegisterUserOutput {
  user: ReturnType<User['toJSON']>;
}

export class RegisterUserUseCase
  implements UseCase<Result<RegisterUserOutput>, RegisterUserInput>
{
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService:    IHashService,
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {

    // 1 — Reject if email is already taken
    const emailTaken = await this.userRepository.existsByEmail(input.email);
    if (emailTaken) {
      return Result.fail('A user with this email already exists');
    }

    // 2 — Hash the password; plain text never touches the database
    const passwordHash = await this.hashService.hash(input.password);

    // 3 — Create the User entity; throws if validation fails (bad email, empty name)
    const user = User.create({
      email:          input.email,
      passwordHash,
      firstName:      input.firstName,
      lastName:       input.lastName,
      role:           input.role,
      isActive:       true,
      organizationId: input.organizationId,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    });

    // 4 — Persist via the repository; toJSON() ensures passwordHash is never in the response
    const saved = await this.userRepository.save(user);

    return Result.ok({ user: saved.toJSON() });
  }
}