import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IAIProvider }       from '../domain/IAIProvider';
import { ITicketRepository } from '../../tickets/domain/ITicketRepository';
import { IUserRepository }   from '../../auth/domain/IUserRepository';

// ── Input ────────────────────────────────────────────────
export interface DraftResponseInput {
  ticketId: string; // which ticket to draft a response for
  agentId:  string; // who is requesting the draft
}

// ── Output ───────────────────────────────────────────────
export interface DraftResponseOutput {
  draft: string; // the suggested reply text
                 // agent reviews and edits before sending
}

// ── Use-case ─────────────────────────────────────────────
export class DraftResponseUseCase
  implements UseCase<Result<DraftResponseOutput>, DraftResponseInput>
{
  constructor(
    private readonly aiProvider:       IAIProvider,
    private readonly ticketRepository: ITicketRepository,
    private readonly userRepository:   IUserRepository,
  ) {}

  async execute(input: DraftResponseInput): Promise<Result<DraftResponseOutput>> {

    // Step 1 — Find the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // Step 2 — Get the full conversation history
    const messages = await this.ticketRepository.findMessagesByTicketId(
      input.ticketId
    );

    if (messages.length === 0) {
      return Result.fail('No messages found on this ticket');
    }

    // Step 3 — Build conversation for the AI
    // The AI needs to know who said what to write a good response
    // We label each message as "client" or "agent"
    const conversationForAI = await Promise.all(
      messages.map(async (message) => {

        // Find out who sent this message
        const author = await this.userRepository.findById(message.authorId);

        // Label the message role for the AI
        const role = author?.isClient() ? 'client' : 'agent';

        return {
          role: role as 'client' | 'agent',
          body: message.body,
        };
      })
    );

    // Step 4 — Get the category from aiTriage if available
    // This helps the AI understand the type of issue
    let category = 'General';
    if (ticket.aiTriage) {
      try {
        const triage = JSON.parse(ticket.aiTriage);
        category = triage.category ?? 'General';
      } catch {
        // aiTriage might not be valid JSON — use default
        category = 'General';
      }
    }

    // Step 5 — Ask Gemini to draft a response
    // Gemini reads the full conversation and writes a professional reply
    const result = await this.aiProvider.draftResponse({
      ticketTitle:    ticket.title,
      ticketCategory: category,
      messages:       conversationForAI,
    });

    // The draft is returned to the agent for review
    // The agent can edit it before sending
    // It is NOT automatically sent — human stays in control
    return Result.ok({ draft: result.draft });
  }
}