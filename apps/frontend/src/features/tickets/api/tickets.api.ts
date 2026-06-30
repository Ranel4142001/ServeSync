import api from '@shared/lib/api';

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
