// Contract for any AI provider — use-cases depend on this interface, not on Gemini directly
// Swap providers (e.g. Gemini → OpenAI) by writing a new implementation without touching use-cases

// Result of analyzing a ticket
export interface TriageResult {
  category: string; // e.g. "Billing", "Bug", "Feature Request"
  priority: string; // e.g. "LOW", "MEDIUM", "HIGH", "URGENT"
  summary:  string;
}

// Result of drafting a response
export interface DraftResult {
  draft: string;
}

export interface IAIProvider {

  // Analyze a ticket title and body, return category, priority, and summary
  triageTicket(params: {
    title: string;
    body:  string;
  }): Promise<TriageResult>;

  // Read the full conversation and draft a reply for the agent to review before sending
  draftResponse(params: {
    ticketTitle:    string;
    ticketCategory: string;
    messages: {
      role: 'client' | 'agent';
      body: string;
    }[];
  }): Promise<DraftResult>;
}