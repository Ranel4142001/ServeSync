// This is the CONTRACT for any AI provider
// The use-cases talk to this interface — not to Gemini directly
// This means if Google Gemini becomes too expensive tomorrow,
// you can swap to OpenAI by writing a new implementation
// without touching a single use-case

// The result of analyzing a ticket
export interface TriageResult {
  category: string;  // e.g. "Billing", "Bug", "Feature Request"
  priority: string;  // e.g. "LOW", "MEDIUM", "HIGH", "URGENT"
  summary:  string;  // a short AI-generated summary of the issue
}

// The result of drafting a response
export interface DraftResult {
  draft: string; // the suggested reply text for the agent
}

export interface IAIProvider {

  // Reads a ticket title and body, returns triage information
  // e.g. category: "Bug", priority: "HIGH"
  triageTicket(params: {
    title:    string; // ticket title
    body:     string; // first message on the ticket
  }): Promise<TriageResult>;

  // Reads the entire ticket conversation and drafts a reply
  // The agent reviews and edits before sending
  draftResponse(params: {
    ticketTitle:    string;   // context for the AI
    ticketCategory: string;   // helps AI understand the type of issue
    messages: {
      role: 'client' | 'agent'; // who sent each message
      body: string;             // what they said
    }[];
  }): Promise<DraftResult>;
}