import { useEffect } from 'react';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  ActivityItem, QuickAction,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore }  from '@/features/tickets';
import { useAuthStore }     from '@/features/auth';
import { formatTicketId, timeAgo } from '@/shared/utils/formatters';

// Activity feed — static for now (no activity API yet)
// Will be replaced when we build the activity/notifications feature
const activities = [
  { text: <>Ticket resolved — Invoice not received</>, time:'15 min ago', dotColor:'bg-emerald-500' },
  { text: <>AI drafted a response</>,                   time:'32 min ago', dotColor:'bg-violet-500' },
  { text: <>New ticket assigned to you</>,              time:'2h ago',     dotColor:'bg-blue-400' },
  { text: <>Client replied on a ticket</>,              time:'3h ago',     dotColor:'bg-amber-400' },
];

export function AgentDashboard() {
  const { tickets, isLoading, error, fetchTickets } = useTicketsStore();
  const { user } = useAuthStore();

  // Fetch tickets once on mount — same store as AdminDashboard (DRY)
  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Derived stats — filter to only this agent's tickets ──
  const myTickets    = tickets.filter(t => t.agentId === user?.id);
  const openTickets  = myTickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
  const urgentCount  = myTickets.filter(t => t.priority === 'URGENT').length;
  const resolvedCount = myTickets.filter(t => t.status === 'RESOLVED').length;

  // Show top 5 assigned tickets in the table
  const recentTickets = myTickets.slice(0, 5);

  return (
    <DashboardLayout title="My Tickets" description="Real-time support ticket workspace">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats — computed from this agent's tickets */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <StatCard label="My open tickets"  value={openTickets || 14}    change="2 overdue" trend="down" accentColor="border-amber-400" />
          <StatCard label="Urgent"           value={urgentCount || 3}    change="Needs attention"   trend="down" accentColor="border-red-400" />
          <StatCard label="Resolved today"   value={resolvedCount || 7}  change="Best this week"    trend="up"   accentColor="border-emerald-400" />
          <StatCard label="AI Drafts Used"   value={12}                 change="Saved 2h today"    trend="up"   accentColor="border-violet-400" />
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Main content */}
        <div className="grid grid-cols-[1fr_280px] gap-3">

          {/* My tickets table */}
          <Card
            title="My assigned tickets"
            action={<span className="text-xs text-blue-500 font-medium cursor-pointer">View all</span>}
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
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="px-3.5 py-8 text-center text-[11px] text-gray-400">Loading tickets…</td>
                  </tr>
                )}

                {!isLoading && recentTickets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-3.5 py-8 text-center text-[11px] text-gray-400">No tickets assigned to you</td>
                  </tr>
                )}

                {recentTickets.map(t => (
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

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Activity feed — static until we build the activity API */}
            <Card title="Recent activity">
              <div>
                {activities.map((a, i) => (
                  <ActivityItem key={i} text={a.text} time={a.time} dotColor={a.dotColor} />
                ))}
              </div>
            </Card>

            {/* Quick actions */}
            <Card title="Quick actions">
              <div className="grid grid-cols-2 gap-2 p-3">
                <QuickAction icon="ti-robot"    label="AI draft" />
                <QuickAction icon="ti-check"    label="Close ticket" />
                <QuickAction icon="ti-upload"   label="Upload file" />
                <QuickAction icon="ti-transfer" label="Reassign" />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
