import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IAIProvider }       from '../domain/IAIProvider';
import { ITicketRepository } from '../../tickets/domain/ITicketRepository';
import { decodeId } from '@shared/utils/idGenerators';

export interface TriageTicketInput {
  ticketId: string;
}

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
    // 1 — Decode the ID
    const numericTicketId = decodeId(input.ticketId);

    // 2 — Load the ticket
    const ticket = await this.ticketRepository.findById(numericTicketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // 3 — Load messages
    const messages = await this.ticketRepository.findMessagesByTicketId(numericTicketId);
    const firstMessage = messages.length > 0 ? messages[0].body : '';

    // 4 — AI Analysis
    const triageResult = await this.aiProvider.triageTicket({
      title: ticket.title,
      body:  firstMessage,
    });

    // 5 — Persist
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