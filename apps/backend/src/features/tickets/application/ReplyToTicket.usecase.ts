import { UseCase } from "@shared/application/UseCase";
import { Result } from "@shared/domain/Result";
import { Message } from "../domain/Message.entity";
import { Role } from "../../auth/domain/Role.enum";
import { ITicketRepository } from "../domain/ITicketRepository";

// Input — ticket to reply to, message body, and author identity from JWT
export interface ReplyToTicketInput {
  ticketId: string;
  body: string;
  authorId: string;
  role: Role;
  isAiDraft: boolean;
}

// Output — the saved message
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
    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail("Ticket not found");
    }

    // 2 — Reject replies on closed tickets
    if (!ticket.isOpen()) {
      return Result.fail("Cannot reply to a closed ticket");
    }

    // 3 — Create the message entity and persist it
    const message = Message.create({
      body: input.body,
      isAiDraft: input.isAiDraft,
      ticketId: input.ticketId,
      authorId: input.authorId,
      createdAt: new Date(),
    });

    const saved = await this.ticketRepository.saveMessage(message);

    return Result.ok({ message: saved.toJSON() });
  }
}
