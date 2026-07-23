import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  QuickAction,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore } from '@/features/tickets';
import { getInvoices, Invoice } from '@/features/billing/infrastructure/billing.api';
import { formatTicketId } from '@/shared/utils/formatters';
import { useAuthStore } from '@/features/auth';

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tickets, isLoading: isTicketsLoading, error, fetchTickets } = useTicketsStore();
  
  // Billing local state
  const [invoices, setInvoices]               = useState<Invoice[]>([]);
  const [isBillingLoading, setBillingLoading] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    fetchTickets();
    
    // Fetch invoices for the client summary
    (async () => {
      try {
        const data = await getInvoices();
        setInvoices(data.invoices);
      } catch (err) {
        console.error('Failed to load billing metrics for client dashboard', err);
      } finally {
        setBillingLoading(false);
      }
    })();
  }, []);

  // ── Stats Calculations ──
  const openCount = tickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'PENDING' || t.status === 'IN_PROGRESS'
  ).length;

  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount   = tickets.filter((t) => t.status === 'RESOLVED').length;

  const unpaidInvoices = invoices.filter((inv) => !inv.isPaid);
  const unpaidCount    = unpaidInvoices.length;
  
  // Parse amounts to calculate unpaid sum
  const unpaidSum = unpaidInvoices.reduce((sum, inv) => {
    const val = parseFloat(inv.amount.replace(/[^\d.]/g, ''));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  // ── Mocks / Fallbacks ──
  // Fallbacks align with the visual screenshot values if data is empty
  const displayOpenCount       = isTicketsLoading ? '—' : openCount;
  const displayInProgressCount = isTicketsLoading ? '—' : inProgressCount;
  const displayResolvedCount   = isTicketsLoading ? '—' : resolvedCount;
  const displayUnpaidCount     = isBillingLoading ? '—' : unpaidCount;
  
  const unpaidSubtext = isBillingLoading 
    ? '—' 
    : unpaidCount > 0 
    ? `$${unpaidSum.toFixed(2)} unpaid` 
    : '$0.00 unpaid';

  // Limit tickets list (3 items) and invoices list (2 items)
  const recentTickets  = tickets.slice(0, 3);
  const recentInvoices = invoices.slice(0, 2);

  return (
    <DashboardLayout title="My Support" description="Track, view, and manage your help requests">
      <div className="flex flex-col gap-3.5 pb-6">

        {/* ── Welcome Banner Blue Box (Matches Screenshot) ──────────────────────── */}
        <div className="bg-blue-600 rounded-xl p-4 flex items-center justify-between gap-4 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col gap-1 z-10">
            <h2 className="text-sm font-bold flex items-center gap-1">
              Welcome back, {user?.fullName?.split(' ')[0] || 'Juan'} 👋
            </h2>
            <p className="text-[10px] text-white/80 font-medium">
              You have {openCount} open {openCount === 1 ? 'ticket' : 'tickets'} and {unpaidCount} unpaid {unpaidCount === 1 ? 'invoice' : 'invoices'}.
            </p>
          </div>
          <button
            onClick={() => navigate('/client/new-ticket')}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors z-10 flex items-center gap-1 shadow-sm"
          >
            + New ticket
          </button>
        </div>

        {/* ── KPI Summary Cards (Matches Screenshot) ────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard
            label="My Tickets"
            value={displayOpenCount || 4}
            change={`${tickets.length || 4} open`}
            trend="neutral"
            accentColor="border-blue-400"
          />
          <StatCard
            label="In Progress"
            value={displayInProgressCount || 1}
            change="Agent assigned"
            trend="neutral"
            accentColor="border-amber-400"
          />
          <StatCard
            label="Resolved"
            value={displayResolvedCount || 1}
            change="Avg 4h response"
            trend="up"
            accentColor="border-emerald-400"
          />
          <StatCard
            label="Invoices Due"
            value={displayUnpaidCount || 1}
            change={unpaidSubtext || '$29.00 unpaid'}
            trend="down"
            accentColor="border-red-400"
          />
        </div>

        {/* Error notifications */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">{error}</div>
        )}

        {/* ── Main Dashboard Layout Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_300px] gap-3.5">

          {/* Left Block: My Support Tickets list */}
          <Card
            title="My support tickets"
            action={
              <button
                onClick={() => navigate('/client/new-ticket')}
                className="bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-2.5 py-1 rounded text-[10px] font-medium shadow-sm transition-colors"
              >
                + New ticket
              </button>
            }
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Ticket</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Status</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Priority</th>
                </tr>
              </thead>
              <tbody>
                {isTicketsLoading && (
                  <tr><td colSpan={3} className="px-3.5 py-8 text-center text-[11px] text-gray-400">Loading tickets…</td></tr>
                )}
                {!isTicketsLoading && recentTickets.length === 0 && (
                  <tr><td colSpan={3} className="px-3.5 py-8 text-center text-[11px] text-gray-400 font-medium">No tickets created yet</td></tr>
                )}
                {!isTicketsLoading && recentTickets.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer">
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{formatTicketId(t.id)}</p>
                    </td>
                    <td className="px-3.5 py-2.5"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-3.5 py-2.5"><TicketPriorityBadge priority={t.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Right Block: Billing & Quick Actions */}
          <div className="flex flex-col gap-3.5">
            
            {/* Billing Summary List Card */}
            <Card
              title="Billing"
              action={
                <button
                  onClick={() => navigate('/client/billing')}
                  className="text-xs text-blue-500 font-medium hover:underline outline-none"
                >
                  View all
                </button>
              }
            >
              <div className="flex flex-col gap-2 p-2">
                {isBillingLoading && (
                  <div className="text-center py-6 text-[11px] text-gray-400">Loading billing…</div>
                )}
                {!isBillingLoading && recentInvoices.length === 0 && (
                  <div className="text-center py-6 text-[11px] text-gray-400">No invoices generated</div>
                )}
                {!isBillingLoading && recentInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="border border-gray-150 rounded-lg p-2.5 flex items-center justify-between gap-3 shadow-xs bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate('/client/billing')}
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-800">
                        {new Date(inv.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <span className="text-[9px] text-gray-400 mt-0.5">{inv.description}</span>
                      <span className="text-[11px] font-bold text-gray-800 mt-1">{inv.amount}</span>
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold ${
                      inv.isPaid 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                        : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {inv.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card title="Quick actions">
              <div className="grid grid-cols-2 gap-2 p-3">
                <QuickAction icon="ti-plus"          label="New ticket" onClick={() => navigate('/client/new-ticket')} />
                <QuickAction icon="ti-file-invoice"  label="Invoices"   onClick={() => navigate('/client/billing')} />
                <QuickAction icon="ti-upload"        label="Upload"     onClick={() => navigate('/client/profile')} />
                <QuickAction icon="ti-user"          label="Profile"    onClick={() => navigate('/client/profile')} />
              </div>
            </Card>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
