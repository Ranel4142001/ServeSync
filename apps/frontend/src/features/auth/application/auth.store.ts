import { create } from 'zustand';
import { AuthUser, login, register, getMe } from '../infrastructure/auth.api';
import { LoginInput, RegisterInput } from '../infrastructure/auth.api';

// The shape of our auth state
interface AuthState {
  // ── State ──────────────────────────────────────────────
  user:        AuthUser | null; // currently logged in user
  token:       string | null;   // JWT token
  isLoading:   boolean;         // true while API call is in progress
  error:       string | null;   // error message if something went wrong

  // ── Actions ────────────────────────────────────────────
  loginAction:    (input: LoginInput)    => Promise<void>;
  registerAction: (input: RegisterInput) => Promise<void>;
  logoutAction:   ()                     => void;
  loadUser:       ()                     => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  // ── Initial state ───────────────────────────────────────
  user:      null,
  token:     localStorage.getItem('accessToken'), // load from storage on startup
  isLoading: false,
  error:     null,

  // ── Login action ────────────────────────────────────────
  // Called when user submits the login form
  loginAction: async (input: LoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const data = await login(input);

      // Save token to localStorage so it persists on page refresh
      localStorage.setItem('accessToken', data.accessToken);

      set({
        user:      data.user,
        token:     data.accessToken,
        isLoading: false,
        error:     null,
      });
    } catch (error: any) {
      // Extract error message from axios error response
      const message = error.response?.data?.error ?? 'Login failed';
      set({ isLoading: false, error: message });
    }
  },

  // ── Register action ─────────────────────────────────────
  registerAction: async (input: RegisterInput) => {
    set({ isLoading: true, error: null });
    try {
      await register(input);
      // After successful registration redirect to login
      // User must login manually after registering
      set({ isLoading: false, error: null });
    } catch (error: any) {
      const message = error.response?.data?.error ?? 'Registration failed';
      set({ isLoading: false, error: message });
    }
  },

  // ── Logout action ────────────────────────────────────────
  // Clears everything and sends user back to login
  logoutAction: () => {
    localStorage.removeItem('accessToken');
    set({ user: null, token: null, error: null });
    window.location.href = '/login';
  },

  // ── Load user ────────────────────────────────────────────
  // Called on app startup to restore the logged-in user
  // from the token stored in localStorage
  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return; // no token — skip

    set({ isLoading: true });
    try {
      const data = await getMe();
      set({ user: data.user, isLoading: false });
    } catch {
      // Token is invalid or expired — clear it
      localStorage.removeItem('accessToken');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));