import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Ticket }   from '../domain/Ticket.entity';
import { Message }  from '../domain/Message.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

export interface GetTicketByIdInput {
  ticketId:       string;
  userId:         string;
  role:           Role;
  organizationId: string;
}

export interface GetTicketByIdOutput {
  ticket:   ReturnType<Ticket['toJSON']>;
  messages: ReturnType<Message['toJSON']>[];
}

export class GetTicketByIdUseCase
  implements UseCase<Result<GetTicketByIdOutput>, GetTicketByIdInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: GetTicketByIdInput): Promise<Result<GetTicketByIdOutput>> {
    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // 2 — Clients can only view their own tickets
    if (
      input.role === Role.CLIENT &&
      ticket.clientId !== input.userId
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // 3 — Agents and admins can only view tickets within their organization
    if (
      input.role !== Role.CLIENT &&
      ticket.organizationId !== input.organizationId
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // 4 — Load and return the ticket with its messages
    const messages = await this.ticketRepository.findMessagesByTicketId(input.ticketId);

    return Result.ok({
      ticket:   ticket.toJSON(),
      messages: messages.map(m => m.toJSON()),
    });
  }
}