import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Ticket }   from '../domain/Ticket.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

// ── Input ────────────────────────────────────────────────
export interface CloseTicketInput {
  ticketId: string;
  userId:   string;
  role:     Role;
}

// ── Output ───────────────────────────────────────────────
export interface CloseTicketOutput {
  ticket: ReturnType<Ticket['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class CloseTicketUseCase
  implements UseCase<Result<CloseTicketOutput>, CloseTicketInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: CloseTicketInput): Promise<Result<CloseTicketOutput>> {

    // Step 1 — Find the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // Step 2 — Only agents and admins can close tickets
    // Clients cannot close their own tickets
    if (input.role === Role.CLIENT) {
      return Result.fail('Only agents and admins can close tickets');
    }

    // Step 3 — Close the ticket using domain method
    // The business logic of closing lives in the entity
    ticket.close();

    // Step 4 — Save the updated ticket
    const saved = await this.ticketRepository.save(ticket);

    return Result.ok({ ticket: saved.toJSON() });
  }
}