import { create } from 'zustand';
import { Ticket, getTickets, closeTicket as closeTicketApi } from '../infrastructure/tickets.api';

// Shape of our tickets state
interface TicketsState {
  // ── State ──────────────────────────────────────────────
  tickets:   Ticket[];     // all tickets loaded from the backend
  isLoading: boolean;      // true while fetching
  error:     string | null; // error message if fetch failed

  // ── Actions ────────────────────────────────────────────
  fetchTickets: () => Promise<void>;  // load tickets from the API
  closeTicket: (id: string) => Promise<void>; // close a ticket via API
  updateTicketLocal: (id: string, updates: Partial<Ticket>) => void; // update a ticket locally
}

export const useTicketsStore = create<TicketsState>((set) => ({
  // ── Initial state ────────────────────────────────────────
  tickets:   [],
  isLoading: false,
  error:     null,

  // ── Fetch tickets ────────────────────────────────────────
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

  // ── Close ticket via API and update state ─────────────────
  closeTicket: async (id: string) => {
    try {
      await closeTicketApi(id);
      set((state) => ({
        tickets: state.tickets.map((t) =>
          t.id === id ? { ...t, status: 'CLOSED' } : t
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.error ?? 'Failed to close ticket';
      throw new Error(message);
    }
  },

  // ── Update ticket locally ────────────────────────────────
  updateTicketLocal: (id: string, updates: Partial<Ticket>) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }));
  },
}));
