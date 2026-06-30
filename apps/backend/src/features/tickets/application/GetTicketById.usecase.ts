import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Ticket }   from '../domain/Ticket.entity';
import { Message }  from '../domain/Message.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { ITicketRepository } from '../domain/ITicketRepository';
import { decodeId } from '@shared/utils/idGenerators'; // Ensure path is correct

// Input parameters remain strings as they come from the URL/JWT
export interface GetTicketByIdInput {
  ticketId:       string; // e.g. "TICKET-0012"
  userId:         string; // e.g. "USER-0044"
  role:           Role;
  organizationId: string; // e.g. "ORG-0001"
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
    // 1 — Decode public string strings into internal numeric IDs
    const numericTicketId = decodeId(input.ticketId);
    const numericUserId = decodeId(input.userId);
    const numericOrgId = decodeId(input.organizationId);

    // 2 — Load the ticket using numeric ID
    const ticket = await this.ticketRepository.findById(numericTicketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // 3 — Clients can only view their own tickets
    if (
      input.role === Role.CLIENT &&
      ticket.clientId !== numericUserId // Compare numeric values
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // 4 — Agents and admins can only view tickets within their organization
    if (
      input.role !== Role.CLIENT &&
      ticket.organizationId !== numericOrgId // Compare numeric values
    ) {
      return Result.fail('You do not have access to this ticket');
    }

    // 5 — Load and return the ticket with its messages
    const messages = await this.ticketRepository.findMessagesByTicketId(numericTicketId);

    return Result.ok({
      ticket:   ticket.toJSON(),
      messages: messages.map(m => m.toJSON()),
    });
  }
}