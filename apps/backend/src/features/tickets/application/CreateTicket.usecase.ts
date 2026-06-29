import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Ticket }    from '../domain/Ticket.entity';
import { TicketStatus }   from '../domain/TicketStatus.enum';
import { TicketPriority } from '../domain/TicketPriority.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

// ── Input ────────────────────────────────────────────────
export interface CreateTicketInput {
  title:          string;
  priority?:      TicketPriority; // optional — defaults to MEDIUM
  category?:      string;         // optional — AI will assign later
  organizationId: string;         // from the JWT token
  clientId:       string;         // from the JWT token
}

// ── Output ───────────────────────────────────────────────
export interface CreateTicketOutput {
  ticket: ReturnType<Ticket['toJSON']>;
}

// ── Use-case ─────────────────────────────────────────────
export class CreateTicketUseCase
  implements UseCase<Result<CreateTicketOutput>, CreateTicketInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: CreateTicketInput): Promise<Result<CreateTicketOutput>> {

    // Step 1 — Create the Ticket entity
    // Status always starts as OPEN
    // Priority defaults to MEDIUM if not provided
    const ticket = Ticket.create({
      title:          input.title,
      status:         TicketStatus.OPEN,
      priority:       input.priority ?? TicketPriority.MEDIUM,
      category:       input.category ?? null,
      aiTriage:       null,  // AI will fill this in Phase 4
      organizationId: input.organizationId,
      clientId:       input.clientId,
      agentId:        null,  // no agent assigned yet
      createdAt:      new Date(),
      updatedAt:      new Date(),
    });

    // Step 2 — Save to database
    const saved = await this.ticketRepository.save(ticket);

    // Step 3 — Return the created ticket
    return Result.ok({ ticket: saved.toJSON() });
  }
}