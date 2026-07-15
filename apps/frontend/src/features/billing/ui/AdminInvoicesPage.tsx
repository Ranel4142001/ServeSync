import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/ui/DashboardComponents';
import { getInvoices, payInvoice, createInvoice, Invoice } from '../infrastructure/billing.api';

// Simple date formatter helper
function formatInvoiceDate(dateString: string): string {
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function AdminInvoicesPage() {
  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [summary, setSummary]       = useState({ total: 0, totalPaid: '$0.00', totalUnpaid: '$0.00' });
  const [isLoading, setLoading]     = useState(true);
  const [error, setError]           = useState<string | null>(null);
  
  // Filtering & Modal States
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [newAmount, setNewAmount]       = useState('');
  const [newDesc, setNewDesc]           = useState('');
  const [isCreating, setCreating]       = useState(false);

  // Load invoices and summaries
  const loadData = async () => {
    try {
      const data = await getInvoices();
      setInvoices(data.invoices);
      setSummary(data.summary);
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter invoices list
  const filteredInvoices = invoices.filter((inv) => {
    if (activeFilter === 'PAID') return inv.isPaid;
    if (activeFilter === 'UNPAID') return !inv.isPaid;
    return true;
  });

  // Count unpaid invoices
  const unpaidCount = invoices.filter((inv) => !inv.isPaid).length;

  // Handle Mark Paid action
  const handleMarkPaid = async (id: string) => {
    setError(null);
    try {
      await payInvoice(id);
      await loadData(); // Reload stats and lists after successful update
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to update invoice status');
    }
  };

  // Handle Create Invoice submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || !newDesc.trim()) {
      setError('Please provide a valid amount and description');
      return;
    }

    setCreating(true);
    setError(null);
    try {
      await createInvoice(parsedAmount, newDesc);
      setNewAmount('');
      setNewDesc('');
      setCreateModalOpen(false);
      await loadData(); // Reload list
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to create invoice');
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout title="Billing">
      <div className="flex flex-col gap-3.5 pb-6">

        <PageHeader
          title="Billing"
          description="Track and manage billing invoices"
        />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {/* ── Summary Stats Cards (Matches Picture Color Borders) ────────────────── */}
        <div className="grid grid-cols-3 gap-3 mb-1">
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-blue-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Invoices</span>
            <span className="text-xl font-bold text-gray-900">{isLoading ? '—' : summary.total}</span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-red-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Unpaid Balance</span>
            <span className="text-xl font-bold text-gray-900">{isLoading ? '—' : summary.totalUnpaid}</span>
            <span className="text-[9px] text-red-500 font-medium">
              {isLoading ? '—' : `${unpaidCount} ${unpaidCount === 1 ? 'invoice' : 'invoices'} unpaid`}
            </span>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-gray-200 border-l-4 border-emerald-500 flex flex-col gap-1.5 shadow-sm">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total Paid</span>
            <span className="text-xl font-bold text-gray-900">{isLoading ? '—' : summary.totalPaid}</span>
          </div>
        </div>

        {/* ── Filters & Action Button ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 my-1">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'PAID', 'UNPAID'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  activeFilter === f
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-1.5 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <span className="text-sm font-semibold">+</span> Create invoice
          </button>
        </div>

        {/* ── Invoices List Table ───────────────────────────────────────────────── */}
        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Number</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Description</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Amount</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Date</th>
                <th className="px-3.5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-3.5 py-12 text-center text-[11px] text-gray-400">Loading invoices…</td></tr>
              )}
              {!isLoading && filteredInvoices.length === 0 && (
                <tr><td colSpan={6} className="px-3.5 py-12 text-center text-[11px] text-gray-400">No invoices found</td></tr>
              )}
              {!isLoading && filteredInvoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  {/* Number Link */}
                  <td className="px-3.5 py-2.5">
                    <span className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer">
                      {inv.number}
                    </span>
                  </td>
                  {/* Description */}
                  <td className="px-3.5 py-2.5 text-[11px] text-gray-700">
                    {inv.description}
                  </td>
                  {/* Amount */}
                  <td className="px-3.5 py-2.5 text-[11px] font-semibold text-gray-900">
                    {inv.amount}
                  </td>
                  {/* Status Badge */}
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold ${
                      inv.isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {inv.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  {/* Date */}
                  <td className="px-3.5 py-2.5 text-[10px] text-gray-400">
                    {formatInvoiceDate(inv.createdAt)}
                  </td>
                  {/* Actions Mark Paid */}
                  <td className="px-3.5 py-2.5 text-right text-[10px]">
                    {!inv.isPaid && (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                      >
                        Mark paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

      </div>

      {/* ── Modal Dialog: Create Invoice (Custom Premium Look) ─────────────────── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl w-full max-w-sm p-5 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-gray-800">Create new invoice</span>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="flex flex-col gap-3.5">
              {/* Field 1: Amount */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-amount" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Amount ($)
                </label>
                <input
                  id="inv-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={isCreating}
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="e.g. 29.00"
                />
              </div>

              {/* Field 2: Description */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="inv-desc" className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Description
                </label>
                <input
                  id="inv-desc"
                  type="text"
                  required
                  disabled={isCreating}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-gray-200 hover:border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none rounded-md px-3 py-2 text-[11px] text-gray-800 transition-colors shadow-sm"
                  placeholder="e.g. Monthly subscription - July 2026"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isCreating}
                  onClick={() => setCreateModalOpen(false)}
                  className="bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-md text-[10px] font-medium transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newAmount || !newDesc.trim()}
                  className="bg-blue-600 text-white hover:bg-blue-700 px-3.5 py-1.5 rounded-md text-[10px] font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                  {isCreating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
