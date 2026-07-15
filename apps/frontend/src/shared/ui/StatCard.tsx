
interface StatCardProps {
  label:        string;
  value:        string | number;
  change?:      string;
  trend?:       'up' | 'down' | 'neutral';
  accentColor?: string;  // tailwind border color e.g. "border-blue-400"
  sparklineData?: number[]; // data points for the trend chart
  isUrgent?:    boolean;    // urgent highlight style
}

export function StatCard({
  label,
  value,
  change,
  trend = 'neutral',
  accentColor = 'border-blue-400',
  sparklineData,
  isUrgent = false,
}: StatCardProps) {
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

  // Render a responsive SVG Sparkline
  const points = sparklineData || [10, 15, 8, 12, 20, 15, 25];
  const width = 100;
  const height = 30;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min === 0 ? 1 : max - min;
  
  const pathData = points
    .map((val, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // SVG color matches the trend
  const sparklineStroke = isUrgent
    ? '#EF4444' // red
    : trend === 'up'
    ? '#10B981' // emerald
    : trend === 'down'
    ? '#EF4444' // red
    : '#3B82F6'; // blue

  return (
    <div
      className={`relative overflow-hidden bg-white border border-gray-200 border-l-[4px] ${accentColor} rounded-xl px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        isUrgent ? 'bg-red-50/70 border-red-300 border-l-red-500 animate-pulse' : ''
      }`}
    >
      <div className="relative z-10">
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${
          isUrgent ? 'text-red-600' : 'text-gray-400'
        }`}>
          {label}
        </p>
        <p className={`text-2xl font-bold leading-none tracking-tight ${
          isUrgent ? 'text-red-900 font-extrabold' : 'text-gray-900'
        }`}>
          {value}
        </p>
        {change && (
          <p className={`text-[10px] mt-1.5 flex items-center gap-1 font-medium ${
            isUrgent ? 'text-red-700' : trendColor
          }`}>
            <i className={`ti ${trendIcon} text-[10px]`} aria-hidden="true" />
            {change}
          </p>
        )}
      </div>

      {/* Sparkline background graphic */}
      <div className="absolute bottom-2 right-3 w-28 h-8 opacity-20 hover:opacity-40 transition-opacity pointer-events-none">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <path
            d={pathData}
            fill="none"
            stroke={sparklineStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
