import { UseCase }   from '@shared/application/UseCase';
import { Result }    from '@shared/domain/Result';
import { Ticket }    from '../domain/Ticket.entity';
import { TicketStatus }   from '../domain/TicketStatus.enum';
import { TicketPriority } from '../domain/TicketPriority.enum';
import { ITicketRepository } from '../domain/ITicketRepository';
import { decodeId } from '@shared/utils/idGenerators'; // Ensure path is correct

export interface CreateTicketInput {
  title:          string;
  priority?:      TicketPriority;
  category?:      string;
  organizationId: string; // e.g. "ORG-0001"
  clientId:       string; // e.g. "USER-0088"
}

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
    // 1 — Decode string context identifiers to valid business numbers
    const numericOrgId = decodeId(input.organizationId);
    const numericClientId = decodeId(input.clientId);

    // 2 — Create the Ticket entity with numbers under the hood
    const ticket = Ticket.create({
      title:          input.title,
      status:         TicketStatus.OPEN,
      priority:       input.priority ?? TicketPriority.MEDIUM,
      category:       input.category ?? null,
      aiTriage:       null,
      organizationId: numericOrgId,
      clientId:       numericClientId,
      agentId:        null,
      createdAt:      new Date(),
      updatedAt:      new Date(),
    });

    // 3 — Persist and return the saved ticket
    const saved = await this.ticketRepository.save(ticket);

    return Result.ok({ ticket: saved.toJSON() });
  }
}