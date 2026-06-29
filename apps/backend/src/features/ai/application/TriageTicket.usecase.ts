import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IAIProvider }       from '../domain/IAIProvider';
import { ITicketRepository } from '../../tickets/domain/ITicketRepository';

// Input — ticket to analyze
export interface TriageTicketInput {
  ticketId: string;
}

// Output — AI-assigned category, priority, and summary
export interface TriageTicketOutput {
  category: string;
  priority: string;
  summary:  string;
}

export class TriageTicketUseCase
  implements UseCase<Result<TriageTicketOutput>, TriageTicketInput>
{
  constructor(
    private readonly aiProvider:       IAIProvider,
    private readonly ticketRepository: ITicketRepository,
  ) {}

  async execute(input: TriageTicketInput): Promise<Result<TriageTicketOutput>> {

    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // 2 — Load messages and use the first one as the ticket body for analysis
    const messages = await this.ticketRepository.findMessagesByTicketId(
      input.ticketId
    );

    const firstMessage = messages.length > 0 ? messages[0].body : '';

    // 3 — Ask the AI to analyze the ticket title and body
    const triageResult = await this.aiProvider.triageTicket({
      title: ticket.title,
      body:  firstMessage,
    });

    // 4 — Persist the triage result on the ticket and save
    ticket.setAiTriage(JSON.stringify({
      category: triageResult.category,
      priority: triageResult.priority,
      summary:  triageResult.summary,
    }));

    await this.ticketRepository.save(ticket);

    return Result.ok({
      category: triageResult.category,
      priority: triageResult.priority,
      summary:  triageResult.summary,
    });
  }
}