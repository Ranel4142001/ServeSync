import api from '@shared/lib/api';

// ── Types ────────────────────────────────────────────────

export interface Invoice {
  id:          string;
  amount:      string;   // pre-formatted e.g. "$150.00"
  description: string;
  isPaid:      boolean;
  paidAt:      string | null;
  createdAt:   string;
}

export interface GetInvoicesResponse {
  invoices: Invoice[];
  summary: {
    total:       number;
    totalPaid:   string;
    totalUnpaid: string;
  };
}

// ── API calls ────────────────────────────────────────────

// GET /billing/invoices — list all invoices (admin only)
export async function getInvoices(): Promise<GetInvoicesResponse> {
  const response = await api.get<GetInvoicesResponse>('/billing/invoices');
  return response.data;
}
