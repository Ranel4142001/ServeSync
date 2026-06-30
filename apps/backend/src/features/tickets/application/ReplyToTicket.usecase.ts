import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Message } from "../domain/Message.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";
import { decodeId } from "@shared/utils/idGenerators";

export interface ReplyToTicketInput {
  ticketId: string; // e.g., "TICKET-0451"
  body: string;
  authorId: string; // e.g., "USER-0012"
  role: Role;
  isAiDraft: boolean;
}

export interface ReplyToTicketOutput {
  message: ReturnType<Message["toJSON"]>;
}

export class ReplyToTicketUseCase implements UseCase<
  Result<ReplyToTicketOutput>,
  ReplyToTicketInput
> {
  constructor(private readonly ticketRepository: ITicketRepository) {}

  async execute(
    input: ReplyToTicketInput,
  ): Promise<Result<ReplyToTicketOutput>> {
    // Clean parsing step
    const numericTicketId = decodeId(input.ticketId);
    const numericAuthorId = decodeId(input.authorId);

    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(numericTicketId);
    if (!ticket) {
      return Result.fail("Ticket not found");
    }

    // 2 — Reject replies on closed tickets
    if (!ticket.isOpen()) {
      return Result.fail("Cannot reply to a closed ticket");
    }

    // 3 — Create the message entity with numeric values and persist it
    const message = Message.create({
      body: input.body,
      isAiDraft: input.isAiDraft,
      ticketId: numericTicketId,
      authorId: numericAuthorId,
      createdAt: new Date(),
    });

    const saved = await this.ticketRepository.saveMessage(message);

    return Result.ok({ message: saved.toJSON() });
  }
}
