import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  ActivityItem, QuickAction,
} from '@/shared/components/ui/DashboardComponents';

// Mock data — replace with real API calls via useTicketsStore
const myTickets = [
  { id:'#1042', title:'Cannot login to account',    status:'IN_PROGRESS', priority:'URGENT', client:'Juan Santos', aiDraft:true },
  { id:'#1039', title:'API rate limit exceeded',    status:'OPEN',        priority:'HIGH',   client:'Maria Reyes', aiDraft:true },
  { id:'#1037', title:'Export not working',         status:'OPEN',        priority:'MEDIUM', client:'Pedro Lim',   aiDraft:false },
  { id:'#1035', title:'Dashboard shows wrong data', status:'IN_PROGRESS', priority:'MEDIUM', client:'Anna Cruz',   aiDraft:false },
];

const activities = [
  { text: <>You resolved <strong>#1041</strong> — Invoice not received</>, time:'15 min ago', dotColor:'bg-emerald-500' },
  { text: <>AI drafted a response for <strong>#1042</strong></>,           time:'32 min ago', dotColor:'bg-violet-500' },
  { text: <>New ticket <strong>#1042</strong> assigned to you</>,          time:'2h ago',     dotColor:'bg-blue-400' },
  { text: <>Client replied on <strong>#1039</strong></>,                   time:'3h ago',     dotColor:'bg-amber-400' },
];

export function AgentDashboard() {
  return (
    <DashboardLayout title="My Tickets">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats */}
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label="My open tickets"  value="14" change="2 overdue"       trend="down"    accentColor="border-amber-400" />
          <StatCard label="Urgent"           value="3"  change="Needs attention"  trend="down"    accentColor="border-red-400" />
          <StatCard label="Resolved today"   value="7"  change="Best this week"   trend="up"      accentColor="border-emerald-400" />
          <StatCard label="AI drafts used"   value="12" change="Saved 2h today"   trend="up"      accentColor="border-violet-400" />
        </div>

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
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Client</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">AI</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer">
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{t.id}</p>
                    </td>
                    <td className="px-3.5 py-2.5"><TicketStatusBadge status={t.status} /></td>
                    <td className="px-3.5 py-2.5"><TicketPriorityBadge priority={t.priority} /></td>
                    <td className="px-3.5 py-2.5 text-[11px] text-gray-700">{t.client}</td>
                    <td className="px-3.5 py-2.5">
                      {t.aiDraft
                        ? <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-violet-50 text-violet-800">Draft ready</span>
                        : <span className="text-[10px] text-gray-400">—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Activity feed */}
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
