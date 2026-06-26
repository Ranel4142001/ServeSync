import { UseCase } from '@shared/application/UseCase';
import { Result }  from '@shared/domain/Result';
import { User }    from '../domain/User.entity';
import { Role }    from '../domain/Role.enum';
import { IUserRepository } from '../domain/IUserRepository';
import { IHashService }    from '../domain/IHashService';

// ── Input ────────────────────────────────────────────────
// Exactly what the caller must provide to register a user
export interface RegisterUserInput {
  email:          string;
  password:       string;  // plain text — we hash it here
  firstName:      string;
  lastName:       string;
  role:           Role;
  organizationId: string;
}

// ── Output ───────────────────────────────────────────────
// What the use-case returns on success
export interface RegisterUserOutput {
  user: ReturnType<User['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class RegisterUserUseCase
  implements UseCase<Result<RegisterUserOutput>, RegisterUserInput>
{
  // Dependencies are injected — this class never creates them itself
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService:    IHashService,
  ) {}

  async execute(input: RegisterUserInput): Promise<Result<RegisterUserOutput>> {

    // Step 1 — Check if email is already taken
    const emailTaken = await this.userRepository.existsByEmail(input.email);
    if (emailTaken) {
      return Result.fail('A user with this email already exists');
    }

    // Step 2 — Hash the password before storing it
    // Plain text password never touches the database
    const passwordHash = await this.hashService.hash(input.password);

    // Step 3 — Create the User entity using the factory method
    // If validation fails (bad email, empty name) it throws here
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

    // Step 4 — Persist the user via the repository interface
    // We don't know if this is Prisma, MongoDB, or a text file
    const saved = await this.userRepository.save(user);

    // Step 5 — Return success with the serialized user
    // toJSON() ensures passwordHash is never in the response
    return Result.ok({ user: saved.toJSON() });
  }
}