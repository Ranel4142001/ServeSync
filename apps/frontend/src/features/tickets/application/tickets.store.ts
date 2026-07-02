import { create } from 'zustand';
import { Ticket, getTickets } from '../infrastructure/tickets.api';

// Shape of our tickets state
interface TicketsState {
  // ── State ──────────────────────────────────────────────
  tickets:   Ticket[];     // all tickets loaded from the backend
  isLoading: boolean;      // true while fetching
  error:     string | null; // error message if fetch failed

  // ── Actions ────────────────────────────────────────────
  fetchTickets: () => Promise<void>;  // load tickets from the API
}

export const useTicketsStore = create<TicketsState>((set) => ({
  // ── Initial state ────────────────────────────────────────
  tickets:   [],
  isLoading: false,
  error:     null,

  // ── Fetch tickets ────────────────────────────────────────
  // Called when the dashboard mounts — loads all tickets the user can see
  // The backend handles role-based filtering via the JWT token
  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getTickets();
      set({ tickets: data.tickets, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.error ?? 'Failed to load tickets';
      set({ isLoading: false, error: message });
    }
  },
}));
