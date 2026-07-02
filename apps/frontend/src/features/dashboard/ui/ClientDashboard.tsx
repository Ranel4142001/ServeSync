import { useEffect } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  QuickAction,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore } from '@/features/tickets';
import { formatTicketId, timeAgo } from '@/shared/utils/formatters';

export function ClientDashboard() {
  const { tickets, isLoading, error, fetchTickets } = useTicketsStore();

  // Fetch tickets on mount — backend auto-filters to this client's tickets
  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Derived stats ──
  const openTickets    = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;

  // Show top 5 tickets in the table
  const recentTickets = tickets.slice(0, 5);

  return (
    <DashboardLayout title="Overview">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats */}
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label="Open tickets"   value={openTickets}       change={`${tickets.length} total`} trend="neutral" accentColor="border-blue-400" />
          <StatCard label="Resolved"       value={resolvedTickets}   change="All time"                  trend="up"      accentColor="border-emerald-400" />
          <StatCard label="Total tickets"  value={tickets.length}    change="Lifetime"                  trend="neutral" accentColor="border-amber-400" />
          <StatCard label="Closed"         value={tickets.filter(t => t.status === 'CLOSED').length} change="Completed" trend="up" accentColor="border-violet-400" />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-[1fr_280px] gap-3">

          {/* My tickets */}
          <Card
            title="My tickets"
            action={<span className="text-xs text-blue-500 font-medium cursor-pointer">View all</span>}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Ticket</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Status</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Priority</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={4} className="px-3.5 py-8 text-center text-[11px] text-gray-400">Loading tickets…</td>
                  </tr>
                )}

                {!isLoading && recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3.5 py-8 text-center text-[11px] text-gray-400">No tickets yet</td>
                  </tr>
                )}

                {recentTickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer">
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{formatTicketId(t.id)}</p>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TicketStatusBadge status={t.status} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TicketPriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{timeAgo(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Quick actions */}
            <Card title="Quick actions">
              <div className="grid grid-cols-2 gap-2 p-3">
                <QuickAction icon="ti-plus"          label="New ticket" />
                <QuickAction icon="ti-file-invoice"  label="Invoices" />
                <QuickAction icon="ti-user"          label="My profile" />
                <QuickAction icon="ti-help"          label="Help center" />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
