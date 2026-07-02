import api from '@shared/infrastructure/api';

// ── Types ────────────────────────────────────────────────

export interface Organization {
  id:        string;
  code:      string;   // e.g. "ORG-4821"
  name:      string;
  slug:      string;
  createdAt: string;
  updatedAt: string;
}

// ── API calls ────────────────────────────────────────────

// GET /organizations/:id — fetch a single organization by id
export async function getOrganization(id: string): Promise<Organization> {
  const response = await api.get<Organization>(`/organizations/${id}`);
  return response.data;
}