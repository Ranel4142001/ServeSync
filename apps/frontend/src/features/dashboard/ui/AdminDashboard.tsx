import { useEffect } from 'react';
import { DashboardLayout }  from '@/shared/ui/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  Avatar, CategoryBar, QuickAction,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore } from '@/features/tickets';
import { formatTicketId, timeAgo } from '@/shared/utils/formatters';


// Color map for category bars — each category gets a distinct color
const categoryColors: Record<string, string> = {
  Billing:       'bg-blue-400',
  Bug:           'bg-red-400',
  Feature:       'bg-violet-400',
  Account:       'bg-emerald-400',
  General:       'bg-gray-300',
  Uncategorized: 'bg-gray-300',
};

export function AdminDashboard() {
  // Read state + action from the tickets store
  const { tickets, isLoading, error, fetchTickets } = useTicketsStore();

  // Fetch tickets once when the dashboard mounts
  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Derived stats (computed from real data, not hardcoded) ──
  const totalTickets   = tickets.length;
  const openTickets    = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
  const urgentTickets  = tickets.filter(t => t.priority === 'URGENT').length;
  const resolvedTickets = tickets.filter(t => t.status === 'RESOLVED').length;

  // Show the 5 most recent tickets in the table
  const recentTickets = tickets.slice(0, 5);

  // ── Category breakdown (group tickets by category, count each) ──
  const categoryCounts = tickets.reduce<Record<string, number>>((acc, t) => {
    const cat = t.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // Convert to array sorted by count (highest first) for the bar chart
  const categories = Object.entries(categoryCounts)
    .map(([label, value]) => ({
      label,
      value,
      color: categoryColors[label] ?? 'bg-gray-300',
    }))
    .sort((a, b) => b.value - a.value);

  // The max value for the bar chart — used to calculate bar widths
  const maxCategoryValue = categories.length > 0 ? categories[0].value : 1;

  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats — all derived from real ticket data */}
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label="Total tickets"   value={totalTickets}    change={`${openTickets} open`}      trend="neutral"  accentColor="border-blue-400" />
          <StatCard label="Open tickets"    value={openTickets}     change={`${urgentTickets} urgent`}  trend={urgentTickets > 0 ? 'down' : 'up'}  accentColor="border-amber-400" />
          <StatCard label="Resolved"        value={resolvedTickets} change="All time"                   trend="up"       accentColor="border-emerald-400" />
          <StatCard label="Urgent"          value={urgentTickets}   change="Needs attention"            trend={urgentTickets > 0 ? 'down' : 'up'} accentColor="border-red-400" />
        </div>

        {/* Error message if fetch failed */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-[1fr_280px] gap-3">

          {/* Tickets table */}
          <Card
            title="Recent tickets"
            action={<span className="text-xs text-blue-500 font-medium cursor-pointer">View all</span>}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Ticket</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Status</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Priority</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Agent</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Created</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading state */}
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-3.5 py-8 text-center text-[11px] text-gray-400">
                      Loading tickets…
                    </td>
                  </tr>
                )}

                {/* Empty state — no tickets yet */}
                {!isLoading && recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-3.5 py-8 text-center text-[11px] text-gray-400">
                      No tickets found
                    </td>
                  </tr>
                )}

                {/* Ticket rows — uses real data from the store */}
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
                    <td className="px-3.5 py-2.5">
                      {t.agentName
                        ? <div className="flex items-center gap-1.5"><Avatar name={t.agentName} /><span className="text-[11px] text-gray-700">{t.agentName}</span></div>
                        : <span className="text-[10px] text-gray-400">Unassigned</span>
                      }
                    </td>
                    <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{timeAgo(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Category chart — built from real ticket data */}
            <Card title="Tickets by category">
              <div className="px-3.5 py-3 flex flex-col gap-2">
                {categories.length > 0
                  ? categories.map(c => (
                      <CategoryBar key={c.label} {...c} max={maxCategoryValue} />
                    ))
                  : <p className="text-[10px] text-gray-400 text-center py-2">No data yet</p>
                }
              </div>
            </Card>

            {/* Quick actions */}
            <Card title="Quick actions">
              <div className="grid grid-cols-2 gap-2 p-3">
                <QuickAction icon="ti-user-plus"    label="Invite agent" />
                <QuickAction icon="ti-file-invoice" label="New invoice" />
                <QuickAction icon="ti-robot"        label="AI settings" />
                <QuickAction icon="ti-chart-bar"    label="Reports" />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
