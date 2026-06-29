import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Ticket }    from '../domain/Ticket.entity';
import { TicketStatus }   from '../domain/TicketStatus.enum';
import { TicketPriority } from '../domain/TicketPriority.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

// Input — title and optional priority/category; organizationId and clientId from JWT
export interface CreateTicketInput {
  title:          string;
  priority?:      TicketPriority;
  category?:      string;
  organizationId: string;
  clientId:       string;
}

// Output — the newly created ticket
export interface CreateTicketOutput {
  ticket: ReturnType<Ticket['toJSON']>;
}

export class CreateTicketUseCase
  implements UseCase<Result<CreateTicketOutput>, CreateTicketInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: CreateTicketInput): Promise<Result<CreateTicketOutput>> {

    // 1 — Create the Ticket entity; status starts as OPEN, priority defaults to MEDIUM
    const ticket = Ticket.create({
      title:          input.title,
      status:         TicketStatus.OPEN,
      priority:       input.priority ?? TicketPriority.MEDIUM,
      category:       input.category ?? null,
      aiTriage:       null,
      organizationId: input.organizationId,
      clientId:       input.clientId,
      agentId:        null,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    });

    // 2 — Persist and return the saved ticket
    const saved = await this.ticketRepository.save(ticket);

    return Result.ok({ ticket: saved.toJSON() });
  }
}