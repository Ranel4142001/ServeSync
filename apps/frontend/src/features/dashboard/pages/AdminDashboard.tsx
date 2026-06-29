import { DashboardLayout }  from '@/shared/components/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  Avatar, CategoryBar, QuickAction,
} from '@/shared/components/ui/DashboardComponents';

// Mock tickets — replace with real API data via useTicketsStore
const recentTickets = [
  { id:'#1042', title:'Cannot login to account',    status:'IN_PROGRESS', priority:'URGENT', agent:'Jose Cruz',   time:'2h ago' },
  { id:'#1041', title:'Invoice not received',        status:'OPEN',        priority:'HIGH',   agent:'Maria Santos', time:'4h ago' },
  { id:'#1040', title:'Feature request: dark mode',  status:'OPEN',        priority:'MEDIUM', agent:null,           time:'6h ago' },
  { id:'#1039', title:'API rate limit exceeded',     status:'RESOLVED',    priority:'HIGH',   agent:'Jose Cruz',   time:'1d ago' },
  { id:'#1038', title:'Billing cycle question',      status:'CLOSED',      priority:'LOW',    agent:'Maria Santos', time:'2d ago' },
];

const categories = [
  { label:'Billing', value:72, color:'bg-blue-400' },
  { label:'Bug',     value:55, color:'bg-red-400' },
  { label:'Feature', value:48, color:'bg-violet-400' },
  { label:'Account', value:38, color:'bg-emerald-400' },
  { label:'General', value:25, color:'bg-gray-300' },
];

export function AdminDashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats */}
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label="Total tickets"  value="248" change="12% this week"  trend="up"      accentColor="border-blue-400" />
          <StatCard label="Open tickets"   value="42"  change="3 urgent"       trend="down"    accentColor="border-amber-400" />
          <StatCard label="Resolved today" value="18"  change="94% rate"       trend="up"      accentColor="border-emerald-400" />
          <StatCard label="AI drafts used" value="67"  change="28% adoption"   trend="up"      accentColor="border-violet-400" />
        </div>

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
                {recentTickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer">
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{t.id}</p>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TicketStatusBadge status={t.status} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TicketPriorityBadge priority={t.priority} />
                    </td>
                    <td className="px-3.5 py-2.5">
                      {t.agent
                        ? <div className="flex items-center gap-1.5"><Avatar name={t.agent} /><span className="text-[11px] text-gray-700">{t.agent}</span></div>
                        : <span className="text-[10px] text-gray-400">Unassigned</span>
                      }
                    </td>
                    <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{t.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Right column */}
          <div className="flex flex-col gap-3">

            {/* Category chart */}
            <Card title="Tickets by category">
              <div className="px-3.5 py-3 flex flex-col gap-2">
                {categories.map(c => (
                  <CategoryBar key={c.label} {...c} max={72} />
                ))}
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
