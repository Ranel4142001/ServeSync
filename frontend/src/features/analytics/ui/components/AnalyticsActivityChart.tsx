import { useState } from 'react';

interface ChartDataPoint {
  label: string;
  tickets: number;
  messages: number;
  dateStr: string;
}

interface AnalyticsActivityChartProps {
  data: ChartDataPoint[];
}

export function AnalyticsActivityChart({ data }: AnalyticsActivityChartProps) {
  const [metric, setMetric] = useState<'messages' | 'tickets'>('messages');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Compute scale
  const values = data.map((d) => (metric === 'messages' ? d.messages : d.tickets));
  const maxValue = Math.max(...values, 10); // avoid division by 0, default max 10
  const yTicks = [0, Math.round(maxValue * 0.25), Math.round(maxValue * 0.5), Math.round(maxValue * 0.75), maxValue];

  // Bar spacing
  const barCount = data.length;
  const barWidth = Math.max(12, Math.min(32, (chartWidth / barCount) * 0.5));
  const colWidth = chartWidth / barCount;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header / Controls */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            {metric === 'messages' ? 'Sent Messages (Total)' : 'New Ticket Inflow'}
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Daily activity trends over the last 14 days
          </p>
        </div>

        {/* Toggle metric */}
        <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setMetric('messages')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${
              metric === 'messages'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Messages
          </button>
          <button
            onClick={() => setMetric('tickets')}
            className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md transition-all cursor-pointer ${
              metric === 'tickets'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Tickets
          </button>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="p-5 relative select-none">
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto">
          {/* Gradients */}
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="barHoverGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#2563EB" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {yTicks.map((tick, index) => {
            const y = paddingTop + chartHeight - (tick / maxValue) * chartHeight;
            return (
              <g key={index}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  stroke="#F3F4F6"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-gray-400 font-mono text-[9px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Render Bars */}
          {data.map((d, idx) => {
            const val = metric === 'messages' ? d.messages : d.tickets;
            const barHeight = (val / maxValue) * chartHeight;
            const x = paddingLeft + idx * colWidth + (colWidth - barWidth) / 2;
            const y = paddingTop + chartHeight - barHeight;

            const isHovered = hoveredIdx === idx;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="cursor-pointer"
              >
                {/* Invisible hover-capture column rectangle for easier mouse interaction */}
                <rect
                  x={paddingLeft + idx * colWidth}
                  y={paddingTop}
                  width={colWidth}
                  height={chartHeight}
                  fill="transparent"
                />

                {/* Actual Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx={4}
                  ry={4}
                  fill={isHovered ? 'url(#barHoverGradient)' : 'url(#barGradient)'}
                  className="transition-all duration-300 ease-out"
                />

                {/* X axis labels */}
                <text
                  x={x + barWidth / 2}
                  y={svgHeight - paddingBottom + 16}
                  textAnchor="middle"
                  className={`font-medium text-[9px] transition-colors duration-150 ${
                    isHovered ? 'fill-blue-600 font-bold' : 'fill-gray-400'
                  }`}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Bottom X-axis line */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={svgWidth - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="#E5E7EB"
            strokeWidth="1"
          />
        </svg>

        {/* Dynamic HTML Tooltip overlay */}
        {hoveredIdx !== null && (
          <div
            className="absolute z-10 bg-slate-900 text-white rounded-lg px-2.5 py-1.5 text-[10px] pointer-events-none shadow-md border border-slate-800 animate-fade-in"
            style={{
              left: `${
                ((paddingLeft + hoveredIdx * colWidth + colWidth / 2) / svgWidth) * 100
              }%`,
              transform: 'translateX(-50%)',
              bottom: `${
                (((chartHeight -
                  ((metric === 'messages' ? data[hoveredIdx].messages : data[hoveredIdx].tickets) /
                    maxValue) *
                    chartHeight) +
                  paddingTop) /
                  svgHeight) *
                  100 +
                8
              }%`,
            }}
          >
            <div className="font-semibold">{data[hoveredIdx].dateStr}</div>
            <div className="mt-0.5 text-blue-300 font-bold">
              {metric === 'messages'
                ? `${data[hoveredIdx].messages} messages`
                : `${data[hoveredIdx].tickets} tickets`}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
