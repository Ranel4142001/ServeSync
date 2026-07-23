import api from '@shared/infrastructure/api';

// ── Types ────────────────────────────────────────────────

export interface UserItem {
  id:        string;
  email:     string;
  fullName:  string;
  role:      string;
  isActive:  boolean;
  createdAt: string;
  ticketsCount?: number;
}

export interface GetUsersResponse {
  users: UserItem[];
  total: number;
}

// ── API calls ────────────────────────────────────────────

// GET /auth/users — list all users in the organization (admin only)
export async function getUsers(): Promise<GetUsersResponse> {
  const response = await api.get<GetUsersResponse>('/auth/users');
  return response.data;
}
