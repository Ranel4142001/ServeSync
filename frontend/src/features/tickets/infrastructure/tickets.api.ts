import api from '@shared/infrastructure/api';

// ── Types ────────────────────────────────────────────────
// These match exactly what the backend GET /tickets returns

export interface Ticket {
  id:         string;
  title:      string;
  status:     string;   // OPEN | PENDING | RESOLVED | CLOSED
  priority:   string;   // LOW | MEDIUM | HIGH | URGENT
  category:   string;   // Billing, Bug, Feature, etc.
  agentId:    string | null;
  agentName:  string | null;
  clientId:   string | null;
  clientName: string | null;
  createdAt:  string;   // ISO date string from the backend
}

export interface GetTicketsResponse {
  tickets: Ticket[];
  total:   number;
}

// ── API calls ────────────────────────────────────────────

// GET /tickets — fetches tickets visible to the logged-in user
// Backend automatically filters by role (admin sees all, client sees own)
export async function getTickets(): Promise<GetTicketsResponse> {
  const response = await api.get<GetTicketsResponse>('/tickets');
  return response.data;
}

// POST /tickets — create a new ticket (client only)
export interface CreateTicketPayload {
  title:     string;
  priority?: string;
  category?: string;
  clientId?: string;
  organizationId?: string;
}

export async function createTicket(payload: CreateTicketPayload): Promise<{ message: string; id: string; title: string }> {
  const response = await api.post<{ message: string; id: string; title: string }>('/tickets', payload);
  return response.data;
}

// PATCH /tickets/:id/close — close a ticket
export async function closeTicket(id: string): Promise<{ message: string; id: string; status: string }> {
  const response = await api.patch<{ message: string; id: string; status: string }>(`/tickets/${id}/close`);
  return response.data;
}

// POST /ai/draft/:ticketId — generate an AI draft response
export async function generateAiDraft(ticketId: string): Promise<{ draft: string }> {
  const response = await api.post<{ draft: string }>(`/ai/draft/${ticketId}`);
  return response.data;
}

export interface TicketDetailsResponse {
  ticket: Ticket;
  messages: {
    id: string;
    body: string;
    authorId: string;
    authorName?: string;
    createdAt: string;
  }[];
}

// GET /tickets/:id — fetch full ticket details and message thread
export async function getTicketDetails(id: string): Promise<TicketDetailsResponse> {
  const response = await api.get<TicketDetailsResponse>(`/tickets/${id}`);
  return response.data;
}
