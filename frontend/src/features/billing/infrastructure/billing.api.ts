import api from '@shared/infrastructure/api';

// ── Types ────────────────────────────────────────────────

export interface Invoice {
  id:          string;
  number:      string;
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

// PATCH /billing/invoices/:id/pay — mark an invoice as paid
export async function payInvoice(id: string | number): Promise<{ message: string; isPaid: boolean }> {
  const response = await api.patch<{ message: string; isPaid: boolean }>(`/billing/invoices/${id}/pay`);
  return response.data;
}

// POST /billing/invoices — create a new invoice
export async function createInvoice(amount: number, description: string): Promise<Invoice> {
  const response = await api.post<Invoice>('/billing/invoices', { amount, description });
  return response.data;
}
