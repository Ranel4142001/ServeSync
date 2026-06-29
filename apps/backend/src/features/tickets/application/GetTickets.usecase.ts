import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { Ticket }   from '../domain/Ticket.entity';
import { Role }     from '../../auth/domain/Role.enum';
import { ITicketRepository } from '../domain/ITicketRepository';

// ── Input ────────────────────────────────────────────────
export interface GetTicketsInput {
  organizationId: string; // from JWT token
  userId:         string; // from JWT token
  role:           Role;   // from JWT token — determines what they can see
}

// ── Output ───────────────────────────────────────────────
export interface GetTicketsOutput {
  tickets: ReturnType<Ticket['toJSON']>[];
}

// ── Use-case ─────────────────────────────────────────────
export class GetTicketsUseCase
  implements UseCase<Result<GetTicketsOutput>, GetTicketsInput>
{
  constructor(
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: GetTicketsInput): Promise<Result<GetTicketsOutput>> {

    let tickets: Ticket[];

    if (input.role === Role.CLIENT) {
      // Clients can ONLY see their own tickets
      // They must never see other clients' tickets
      tickets = await this.ticketRepository.findByClientId(input.userId);
    } else {
      // Agents and Admins can see ALL tickets in the organization
      tickets = await this.ticketRepository.findByOrganizationId(
        input.organizationId
      );
    }

    return Result.ok({
      tickets: tickets.map(t => t.toJSON())
    });
  }
}