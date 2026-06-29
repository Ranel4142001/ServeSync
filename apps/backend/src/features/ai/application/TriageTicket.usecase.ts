import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IAIProvider } from '../domain/IAIProvider';
import { ITicketRepository } from '../../tickets/domain/ITicketRepository';

// ── Input ────────────────────────────────────────────────
export interface TriageTicketInput {
  ticketId: string; // the ticket to analyze
}

// ── Output ───────────────────────────────────────────────
export interface TriageTicketOutput {
  category: string; // AI-assigned category
  priority: string; // AI-assigned priority
  summary:  string; // AI-generated summary
}

// ── Use-case ─────────────────────────────────────────────
export class TriageTicketUseCase
  implements UseCase<Result<TriageTicketOutput>, TriageTicketInput>
{
  constructor(
    // Needs both the AI provider and ticket repository
    // AI provider to analyze, ticket repo to read/update the ticket
    private readonly aiProvider:        IAIProvider,
    private readonly ticketRepository:  ITicketRepository,
  ) {}

  async execute(input: TriageTicketInput): Promise<Result<TriageTicketOutput>> {

    // Step 1 — Find the ticket in the database
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // Step 2 — Get the first message on the ticket
    // This is what the client originally wrote
    // The AI uses this to understand the problem
    const messages = await this.ticketRepository.findMessagesByTicketId(
      input.ticketId
    );

    // Use the first message as the ticket body
    // If no messages yet, use empty string
    const firstMessage = messages.length > 0 ? messages[0].body : '';

    // Step 3 — Ask the AI to analyze the ticket
    // This calls Gemini API under the hood
    const triageResult = await this.aiProvider.triageTicket({
      title: ticket.title,
      body:  firstMessage,
    });

    // Step 4 — Store the AI triage result on the ticket
    // This updates the aiTriage field we defined in the schema
    ticket.setAiTriage(JSON.stringify({
      category: triageResult.category,
      priority: triageResult.priority,
      summary:  triageResult.summary,
    }));

    // Step 5 — Save the updated ticket
    await this.ticketRepository.save(ticket);

    return Result.ok({
      category: triageResult.category,
      priority: triageResult.priority,
      summary:  triageResult.summary,
    });
  }
}