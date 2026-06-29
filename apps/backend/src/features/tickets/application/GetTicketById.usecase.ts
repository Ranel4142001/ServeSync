import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Ticket }   from '../domain/Ticket.entity';
import { Message }  from '../domain/Message.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

// ── Input ────────────────────────────────────────────────
export interface GetTicketByIdInput {
  ticketId:       string;
  userId:         string;
  role:           Role;
  organizationId: string;
}

// ── Output ───────────────────────────────────────────────
export interface GetTicketByIdOutput {
  ticket:   ReturnType<Ticket['toJSON']>;
  messages: ReturnType<Message['toJSON']>[];
}

// ── Use-case ─────────────────────────────────────────────
export class GetTicketByIdUseCase
  implements UseCase<Result<GetTicketByIdOutput>, GetTicketByIdInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: GetTicketByIdInput): Promise<Result<GetTicketByIdOutput>> {

    // Step 1 — Find the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // Step 2 — Check access rights
    // Clients can only view their OWN tickets
    if (
      input.role === Role.CLIENT &&
      ticket.clientId !== input.userId
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // Agents and Admins can only view tickets in their organization
    if (
      input.role !== Role.CLIENT &&
      ticket.organizationId !== input.organizationId
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // Step 3 — Get all messages for this ticket
    const messages = await this.ticketRepository.findMessagesByTicketId(
      input.ticketId
    );

    return Result.ok({
      ticket:   ticket.toJSON(),
      messages: messages.map(m => m.toJSON()),
    });
  }
}