import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/shared/ui/layout/DashboardLayout';
import {
  StatCard, Card, TicketStatusBadge, TicketPriorityBadge,
  Avatar, QuickAction, StatusModal,
} from '@/shared/ui/DashboardComponents';
import { useTicketsStore } from '@/features/tickets';
import { useAuthStore } from '@/features/auth';
import { formatTicketId, timeAgo, formatOrgId } from '@/shared/utils/formatters';

// Modern, high-converting color palette for SaaS dashboard
const categoryColors: Record<string, string> = {
  Billing:       '#1D4ED8', // Primary Blue
  Bug:           '#EF4444', // Red
  Feature:       '#8B5CF6', // Purple
  Account:       '#10B981', // Emerald
  General:       '#F59E0B', // Amber
  Uncategorized: '#6B7280', // Gray
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { tickets, isLoading, error, fetchTickets } = useTicketsStore();
  
  // Modal state to display standardized action messages
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // Fetch tickets once on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // ── Derived stats (computed dynamically from store) ──
  const totalTickets      = tickets.length;
  const openTickets       = tickets.filter(t => t.status === 'OPEN' || t.status === 'PENDING').length;
  const urgentTickets     = tickets.filter(t => t.priority === 'URGENT').length;
  const resolvedTickets   = tickets.filter(t => t.status === 'RESOLVED').length;
  const unassignedTickets = tickets.filter(t => t.agentId === null).length;

  const recentTickets = tickets.slice(0, 5);

  // Count tickets that are successfully auto-triaged by AI (have a non-default category)
  const aiCategorizedCount = tickets.filter(t => t.category && t.category !== 'Uncategorized').length;
  const aiTriageRate = totalTickets > 0 ? Math.round((aiCategorizedCount / totalTickets) * 100) : 0;
  // Estimate time saved by AI (assuming 12 minutes saved per auto-categorized ticket)
  const estimatedHoursSaved = (aiCategorizedCount * 12 / 60).toFixed(1);


  // Group tickets by category for the Doughnut chart
  const categoryCounts = tickets.reduce<Record<string, number>>((acc, t) => {
    const cat = t.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  const categories = Object.entries(categoryCounts)
    .map(([label, value]) => ({
      label,
      value,
      color: categoryColors[label] ?? '#6B7280',
    }))
    .sort((a, b) => b.value - a.value);

  // ── Modal Handler (Strictly follows pattern: Account ID {id} {action} {message}) ──
  const handleQuickAction = (action: string, detail: string) => {
    const accountId = user?.organizationId || '019f65df-cff7-70b7-965b-06bcc4072296';
    setModalMessage(`Account ID ${formatOrgId(accountId)} ${action} ${detail}`);
    setModalOpen(true);

    // Auto close after 3 seconds
    setTimeout(() => {
      setModalOpen(false);
    }, 3000);
  };

  // ── SVG Sparkline Data Mocks (Based on real values) ──
  const urgentTrend = [
    urgentTickets + 1, urgentTickets, urgentTickets + 2, 
    urgentTickets + 1, urgentTickets
  ];
  const unassignedTrend = [
    unassignedTickets + 2, unassignedTickets + 1, unassignedTickets + 3, 
    unassignedTickets + 1, unassignedTickets
  ];
  const aiTriageTrend = [65, 70, 72, 75, aiTriageRate || 75];
  const savedTrend = [
    Math.max(0, parseFloat(estimatedHoursSaved) - 1.2), 
    Math.max(0, parseFloat(estimatedHoursSaved) - 0.8), 
    Math.max(0, parseFloat(estimatedHoursSaved) - 0.4), 
    parseFloat(estimatedHoursSaved)
  ];


  // ── Doughnut Chart Calculation ──
  const totalCategoryVal = categories.reduce((sum, c) => sum + c.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius; // ~377
  let cumulativePercentage = 0;

  return (
    <DashboardLayout title="Dashboard" description="AI-native analytics & operations summary">
      <div className="flex flex-col gap-4 p-6 bg-gray-50 min-h-screen">
        
        {/* ── Reusable Status Modal for Action Success ──────────────────────────── */}
        <StatusModal
          isOpen={modalOpen}
          type="success"
          title="Operation Successful"
          message={modalMessage}
          onClose={() => setModalOpen(false)}
        />

        {/* ── Top Metrics Grid with Sparklines ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Urgent Backlog"
            value={urgentTickets}
            change={urgentTickets > 0 ? "Requires action" : "All clear"}
            trend={urgentTickets > 0 ? 'down' : 'up'}
            accentColor="border-red-500"
            isUrgent={urgentTickets > 0}
            sparklineData={urgentTrend}
          />
          <StatCard
            label="Awaiting Assignment"
            value={unassignedTickets}
            change={`${unassignedTickets} unassigned`}
            trend="neutral"
            accentColor="border-amber-400"
            sparklineData={unassignedTrend}
          />
          <StatCard
            label="AI Triage Rate"
            value={`${aiTriageRate}%`}
            change="Auto-categorized"
            trend="up"
            accentColor="border-purple-400"
            sparklineData={aiTriageTrend}
          />
          <StatCard
            label="AI Time Saved"
            value={`~${estimatedHoursSaved}h`}
            change="Total hours saved"
            trend="up"
            accentColor="border-emerald-400"
            sparklineData={savedTrend}
          />
        </div>


        {/* Error Notification */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 shadow-sm">
            {error}
          </div>
        )}

        {/* ── Main Dashboard Content Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-[1fr_300px] gap-4">

          {/* Left Block: Recent Tickets with Actionable Empty States */}
          <Card
            title="Recent tickets"
            action={
              <button
                onClick={() => navigate('/client/tickets')}
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                View all →
              </button>
            }
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-[11px] text-gray-400">
                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2" />
                Loading tickets...
              </div>
            ) : recentTickets.length === 0 ? (
              /* Actionable Empty State */
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <svg className="w-14 h-14 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3.375M7.5 18.75h9.75m-9.75-6h9.75m-9.75-6h9.75M9 3h.008v.008H9V3zm.008 4.5H9V6h.008v1.5H9v1.5h.008V7.5z" />
                </svg>
                <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">No Tickets Found</h3>
                <p className="text-[10px] text-gray-400 max-w-[240px] mt-1 mb-4 leading-normal">
                  Your inbox is completely clear. Get started by creating your first ticket.
                </p>
                <button
                  onClick={() => navigate('/client/new-ticket')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Create First Ticket
                </button>
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Ticket</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Status</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Priority</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Agent</th>
                    <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-4 py-2.5">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.map(t => (
                    <tr
                      key={t.id}
                      onClick={() => navigate(`/client/tickets#${t.id}`)}
                      className="border-b border-gray-100 last:border-none hover:bg-blue-50/20 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <p className="text-[11px] font-semibold text-gray-900 hover:text-blue-600 transition-colors">{t.title}</p>
                        <p className="text-[9px] text-gray-400 font-mono mt-0.5">{formatTicketId(t.id)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <TicketStatusBadge status={t.status} />
                      </td>
                      <td className="px-4 py-3">
                        <TicketPriorityBadge priority={t.priority} />
                      </td>
                      <td className="px-4 py-3">
                        {t.agentName ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar name={t.agentName} />
                            <span className="text-[10px] text-gray-700 font-medium">{t.agentName}</span>
                          </div>
                        ) : (
                          <span className="text-[9px] font-bold text-gray-400 uppercase bg-gray-100 px-1.5 py-0.5 rounded">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[10px] text-gray-400">{timeAgo(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Right Block: Charts & Actions */}
          <div className="flex flex-col gap-4">

            {/* Interactive Doughnut Chart */}
            <Card title="Tickets by category">
              {categories.length === 0 ? (
                /* Actionable Chart Empty State */
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                  </svg>
                  <p className="text-[10px] text-gray-400 max-w-[200px] mb-3 leading-normal">
                    Categories are assigned dynamically as new tickets are processed.
                  </p>
                  <button
                    onClick={() => handleQuickAction('triage', 'rules initialized')}
                    className="border border-gray-300 hover:border-blue-500 hover:text-blue-600 text-gray-600 font-bold text-[9px] uppercase px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Configure AI Triage
                  </button>
                </div>
              ) : (
                <div className="p-4 flex flex-col items-center justify-center">
                  {/* Dynamic SVG Doughnut Chart */}
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                      <circle cx="100" cy="100" r={radius} fill="transparent" stroke="#E5E7EB" strokeWidth="18" />
                      {categories.map((c) => {
                        const percentage = c.value / totalCategoryVal;
                        const strokeDashoffset = circumference - (percentage * circumference);
                        const rotation = (cumulativePercentage * 360);
                        cumulativePercentage += percentage;

                        return (
                          <circle
                            key={c.label}
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="transparent"
                            stroke={c.color}
                            strokeWidth="18"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            transform={`rotate(${rotation} 100 100)`}
                            className="transition-all duration-500 ease-out hover:stroke-[22px] cursor-pointer"
                          />
                        );
                      })}
                    </svg>
                    {/* Inner Text summary */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Total</span>
                      <span className="text-xl font-extrabold text-gray-800">{totalTickets}</span>
                    </div>
                  </div>

                  {/* Chart Legend List */}
                  <div className="w-full mt-4 flex flex-col gap-1.5 border-t border-gray-100 pt-3">
                    {categories.map(c => {
                      const pct = ((c.value / totalCategoryVal) * 100).toFixed(0);
                      return (
                        <div key={c.label} className="flex items-center justify-between text-[10px] text-gray-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                            <span>{c.label}</span>
                          </div>
                          <span className="font-mono text-gray-400">{c.value} ({pct}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {/* Quick Actions (Complies with success pattern mapping) */}
            <Card title="Quick actions">
              <div className="grid grid-cols-2 gap-2 p-3">
                <QuickAction
                  icon="ti-user-plus"
                  label="Invite agent"
                  onClick={() => handleQuickAction('invite', 'agent invitation sent successfully')}
                />
                <QuickAction
                  icon="ti-file-invoice"
                  label="New invoice"
                  onClick={() => handleQuickAction('invoice', 'draft invoice generated successfully')}
                />
                <QuickAction
                  icon="ti-robot"
                  label="AI settings"
                  onClick={() => handleQuickAction('triage', 'settings updated successfully')}
                />
                <QuickAction
                  icon="ti-chart-bar"
                  label="Reports"
                  onClick={() => handleQuickAction('report', 'generation processed successfully')}
                />
              </div>
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
