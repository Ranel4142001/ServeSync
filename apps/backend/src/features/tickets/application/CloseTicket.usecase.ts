import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Ticket } from "../domain/Ticket.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";

export interface CloseTicketInput {
  ticketId: string;
  userId: string;
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
    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
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