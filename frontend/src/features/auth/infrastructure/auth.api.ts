import api from '@shared/infrastructure/api';

// ── Types ────────────────────────────────────────────────
// These match exactly what our backend returns

export interface LoginInput {
  email:    string;
  password: string;
}

export interface RegisterInput {
  email:          string;
  password:       string;
  firstName:      string;
  lastName:       string;
  role:           string;
  organizationId: string;
}

export interface AuthUser {
  id:             string;
  email:          string;
  fullName:       string;
  role:           string;
  organizationId: string;
}

export interface LoginResponse {
  accessToken: string;
  user:        AuthUser;
}

// ── API calls ────────────────────────────────────────────

// POST /auth/login
export async function login(input: LoginInput): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', input);
  return response.data;
}

// POST /auth/register
export async function register(input: RegisterInput): Promise<{ user: AuthUser }> {
  const response = await api.post<{ user: AuthUser }>('/auth/register', input);
  return response.data;
}

// GET /auth/me — get currently logged in user
export async function getMe(): Promise<{ user: AuthUser }> {
  const response = await api.get<{ user: AuthUser }>('/auth/me');
  return response.data;
}