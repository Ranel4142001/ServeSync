import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Ticket } from "../domain/Ticket.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";

export interface GetTicketsInput {
  organizationId: string;
  userId: string;
  role: Role;
}

export interface GetTicketsOutput {
  tickets: ReturnType<Ticket["toJSON"]>[];
}

export class GetTicketsUseCase implements UseCase<
  Result<GetTicketsOutput>,
  GetTicketsInput
> {
  constructor(private readonly ticketRepository: ITicketRepository) {}

  async execute(input: GetTicketsInput): Promise<Result<GetTicketsOutput>> {
    let tickets: Ticket[];

    // Clients see only their own tickets; agents and admins see all in the organization
    if (input.role === Role.CLIENT) {
      tickets = await this.ticketRepository.findByClientId(input.userId);
    } else {
      tickets = await this.ticketRepository.findByOrganizationId(input.organizationId);
    }

    return Result.ok({
      tickets: tickets.map((t) => t.toJSON()),
    });
  }
}