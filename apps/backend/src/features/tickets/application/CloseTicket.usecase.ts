import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Ticket } from "../domain/Ticket.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";
import { decodeId } from "@shared/utils/idGenerators";

// Input uses string handles from HTTP context
export interface CloseTicketInput {
  ticketId: string; // e.g., "TICKET-0102"
  userId: string;   // e.g., "USER-0045"
  role: Role;
}

export interface CloseTicketOutput {
  ticket: ReturnType<Ticket["toJSON"]>;
}

export class CloseTicketUseCase implements UseCase<
  Result<CloseTicketOutput>,
  CloseTicketInput
> {
  constructor(private readonly ticketRepository: ITicketRepository) {}

  async execute(input: CloseTicketInput): Promise<Result<CloseTicketOutput>> {
    // Decode incoming string elements to core integers
    const numericTicketId = decodeId(input.ticketId);

    // 1 — Load the ticket using the numeric ID
    const ticket = await this.ticketRepository.findById(numericTicketId);
    if (!ticket) {
      return Result.fail("Ticket not found");
    }

    // 2 — Only agents and admins can close tickets
    if (input.role === Role.CLIENT) {
      return Result.fail("Only agents and admins can close tickets");
    }

    // 3 — Close the ticket and persist
    ticket.close();
    const saved = await this.ticketRepository.save(ticket);

    return Result.ok({ ticket: saved.toJSON() });
  }
}