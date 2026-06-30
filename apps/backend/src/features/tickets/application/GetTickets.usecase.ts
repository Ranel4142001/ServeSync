import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Ticket } from "../domain/Ticket.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";
import { decodeId } from "@shared/utils/idGenerators";

// Input uses strings extracted straight out of the client request/JWT
export interface GetTicketsInput {
  organizationId: string; // e.g., "ORG-0001"
  userId: string;         // e.g., "USER-0088"
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

    // Parse values to internal operational types
    const numericUserId = decodeId(input.userId);
    const numericOrgId = decodeId(input.organizationId);

    // Clients see only their own tickets; agents and admins see all in the organization
    if (input.role === Role.CLIENT) {
      tickets = await this.ticketRepository.findByClientId(numericUserId);
    } else {
      tickets = await this.ticketRepository.findByOrganizationId(numericOrgId);
    }

    return Result.ok({
      tickets: tickets.map((t) => t.toJSON()),
    });
  }
}