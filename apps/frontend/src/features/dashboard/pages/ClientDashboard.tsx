import { DashboardLayout } from '@/shared/components/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge,
  QuickAction,
} from '@/shared/components/ui/DashboardComponents';

// Mock data — replace with real API calls via useTicketsStore
const myTickets = [
  { id:'#1042', title:'Cannot login to account',   status:'IN_PROGRESS', updated:'2h ago' },
  { id:'#1038', title:'Billing cycle question',    status:'OPEN',        updated:'1d ago' },
];

export function ClientDashboard() {
  return (
    <DashboardLayout title="Overview">
      <div className="flex flex-col gap-3.5">

        {/* KPI stats */}
        <div className="grid grid-cols-4 gap-2.5">
          <StatCard label="Open tickets"   value="2"  change="1 in progress"   trend="neutral" accentColor="border-blue-400" />
          <StatCard label="Resolved"       value="5"  change="This month"      trend="up"      accentColor="border-emerald-400" />
          <StatCard label="Avg response"   value="4h" change="Under SLA"       trend="up"      accentColor="border-amber-400" />
          <StatCard label="Satisfaction"   value="98%" change="Last 30 days"    trend="up"      accentColor="border-violet-400" />
        </div>

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
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3.5 py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {myTickets.map(t => (
                  <tr key={t.id} className="border-b border-gray-100 last:border-none hover:bg-gray-50 cursor-pointer">
                    <td className="px-3.5 py-2.5">
                      <p className="text-[11px] font-medium text-gray-900">{t.title}</p>
                      <p className="text-[10px] text-gray-400">{t.id}</p>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <TicketStatusBadge status={t.status} />
                    </td>
                    <td className="px-3.5 py-2.5 text-[10px] text-gray-400">{t.updated}</td>
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
