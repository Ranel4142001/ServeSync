interface AnalyticsStatsGridProps {
  totalTickets: number;
  resolvedTickets: number;
  openTickets: number;
  resolutionRate: number;
  slaAdherence: number;
  avgResponseTime: string;
}

export function AnalyticsStatsGrid({
  totalTickets,
  resolvedTickets,
  openTickets,
  resolutionRate,
  slaAdherence,
  avgResponseTime,
}: AnalyticsStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Tickets Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Total Tickets</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-blue-600 tracking-tight">{totalTickets.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
            <i className="ti ti-arrow-up text-[9px]" /> 12%
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">Inflow over selected period</p>
      </div>

      {/* Resolved Tickets Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Resolved Tickets</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{resolvedTickets.toLocaleString()}</p>
          <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md">
            {resolutionRate}% rate
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">Successfully closed tasks</p>
      </div>

      {/* Open Tickets Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Open Backlog</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">{openTickets.toLocaleString()}</p>
          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
            openTickets > 10 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
          }`}>
            Pending
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">Awaiting representative action</p>
      </div>

      {/* SLA Adherence Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SLA Compliance</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-extrabold text-emerald-600 tracking-tight">{slaAdherence.toFixed(1)}%</p>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
            Target 95%
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-2 font-medium">Avg Response: {avgResponseTime}</p>
      </div>
    </div>
  );
}
