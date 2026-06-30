// ── StatCard ──────────────────────────────────────────────
interface StatCardProps {
  label:        string;
  value:        string | number;
  change?:      string;
  trend?:       'up' | 'down' | 'neutral';
  accentColor?: string;  // tailwind border color e.g. "border-blue-400"
}

// KPI card shown at the top of each dashboard
// accent left border color encodes meaning at a glance
export function StatCard({ label, value, change, trend = 'neutral', accentColor = 'border-blue-400' }: StatCardProps) {
  const trendColor = {
    up:      'text-emerald-600',
    down:    'text-red-500',
    neutral: 'text-gray-400',
  }[trend];

  const trendIcon = {
    up:      'ti-arrow-up',
    down:    'ti-arrow-down',
    neutral: 'ti-minus',
  }[trend];

  return (
    <div className={`bg-white border border-gray-200 border-l-[3px] ${accentColor} rounded-xl px-3.5 py-3`}>
      <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-[22px] font-semibold text-gray-900 leading-none tracking-tight">
        {value}
      </p>
      {change && (
        <p className={`text-[10px] mt-1 flex items-center gap-1 ${trendColor}`}>
          <i className={`ti ${trendIcon} text-[10px]`} aria-hidden="true" />
          {change}
        </p>
      )}
    </div>
  );
}
