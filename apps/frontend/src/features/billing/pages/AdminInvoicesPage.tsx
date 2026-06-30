import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import { PageHeader, Card } from '@/shared/components/ui/DashboardComponents';
import { getInvoices, Invoice } from '@/features/billing/api/billing.api';
import { timeAgo } from '@/shared/lib/formatters';

export function AdminInvoicesPage() {
  const [invoices, setInvoices]     = useState<Invoice[]>([]);
  const [summary, setSummary]       = useState({ total: 0, totalPaid: '$0.00', totalUnpaid: '$0.00' });
  const [isLoading, setLoading]     = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Fetch invoices on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getInvoices();
        setInvoices(data.invoices);
        setSummary(data.summary);
      } catch (err: any) {
        setError(err.response?.data?.error ?? 'Failed to load invoices');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <DashboardLayout title="Invoices">
      <div className="flex flex-col gap-3">

        <PageHeader
          title="Invoices"
          count={summary.total}
          description="Track and manage billing invoices"
        />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-3">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total invoices</p>
            <p className="text-lg font-semibold text-gray-900">{summary.total}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-3">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total paid</p>
            <p className="text-lg font-semibold text-emerald-700">{summary.totalPaid}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl px-3.5 py-3">
            <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">Total unpaid</p>
            <p className="text-lg font-semibold text-red-600">{summary.totalUnpaid}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {/* Invoices table */}
        <Card>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Description</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Amount</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Status</th>
                <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2.5">Created</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="px-3.5 py-12 text-center text-[11px] text-gray-400">Loading invoices…</td></tr>
              )}
              {!isLoading && invoices.length === 0 && (
                <tr><td colSpan={4} className="px-3.5 py-12 text-center text-[11px] text-gray-400">No invoices found</td></tr>
              )}
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 transition-colors">
                  <td className="px-3.5 py-2.5">
                    <p className="text-[11px] font-medium text-gray-900">{inv.description}</p>
                    <p className="text-[10px] text-gray-400">{inv.id.slice(0, 12)}…</p>
                  </td>
                  <td className="px-3.5 py-2.5 text-[11px] font-semibold text-gray-900">{inv.amount}</td>
                  <td className="px-3.5 py-2.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${inv.isPaid ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
                      {inv.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{timeAgo(inv.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </DashboardLayout>
  );
}
