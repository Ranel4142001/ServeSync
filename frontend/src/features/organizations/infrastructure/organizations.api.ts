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
export async function getOrganization(id: string | number): Promise<Organization> {
  const response = await api.get<Organization>(`/organizations/${id}`);
  return response.data;
}

// PATCH /organizations/:id — update an organization name and slug
export async function updateOrganization(id: string | number, name: string, slug: string): Promise<Organization> {
  const response = await api.patch<Organization>(`/organizations/${id}`, { name, slug });
  return response.data;
}