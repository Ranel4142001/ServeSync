import { UseCase }  from '@shared/application/UseCase';
import { Result }   from '@shared/domain/Result';
import { IAIProvider }       from '../domain/IAIProvider';
import { ITicketRepository } from '../../tickets/domain/ITicketRepository';
import { IUserRepository }   from '../../auth/domain/IUserRepository';

export interface DraftResponseInput {
  ticketId: number;
  agentId:  number;
}

export interface DraftResponseOutput {
  draft: string;
}

export class DraftResponseUseCase
  implements UseCase<Result<DraftResponseOutput>, DraftResponseInput>
{
  constructor(
    private readonly aiProvider:       IAIProvider,
    private readonly ticketRepository: ITicketRepository,
    private readonly userRepository:   IUserRepository,
  ) {}

  async execute(input: DraftResponseInput): Promise<Result<DraftResponseOutput>> {
    // 1 — Load the ticket
    const ticket = await this.ticketRepository.findById(input.ticketId);
    if (!ticket) {
      return Result.fail('Ticket not found');
    }

    // 2 — Load all messages on the ticket
    const messages = await this.ticketRepository.findMessagesByTicketId(input.ticketId);

    if (messages.length === 0) {
      return Result.fail('No messages found on this ticket');
    }

    // 3 — Map messages
    const conversationForAI = await Promise.all(
      messages.map(async (message) => {
        const author = await this.userRepository.findById(message.authorId);
        const role   = author?.isClient() ? 'client' : 'agent';

        return {
          role: role as 'client' | 'agent',
          body: message.body,
        };
      })
    );

    // 4 — Category extraction
    let category = 'General';
    if (ticket.aiTriage) {
      try {
        const triage = JSON.parse(ticket.aiTriage);
        category = triage.category ?? 'General';
      } catch {
        category = 'General';
      }
    }

    // 5 — AI Generation
    const result = await this.aiProvider.draftResponse({
      ticketTitle:    ticket.title,
      ticketCategory: category,
      messages:       conversationForAI,
    });

    return Result.ok({ draft: result.draft });
  }
}