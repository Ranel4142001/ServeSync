import { useState } from 'react';

interface HeatmapCell {
  day: number; // 0 = Mon, 6 = Sun
  hour: number; // 9 to 17
  count: number;
}

interface AnalyticsHeatmapProps {
  data: HeatmapCell[];
}

export function AnalyticsHeatmap({ data }: AnalyticsHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number; count: number } | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [9, 10, 11, 12, 13, 14, 15, 16, 17];

  const getCellData = (dayIdx: number, hourVal: number) => {
    return data.find((c) => c.day === dayIdx && c.hour === hourVal) || { day: dayIdx, hour: hourVal, count: 0 };
  };

  // Determine background color and text color based on intensity
  const getCellClasses = (count: number) => {
    if (count === 0) return 'bg-gray-50 text-gray-300';
    if (count < 10) return 'bg-blue-50 text-blue-600 border border-blue-100/50';
    if (count < 30) return 'bg-blue-100/70 text-blue-700 font-medium';
    if (count < 60) return 'bg-blue-200 text-blue-800 font-semibold';
    if (count < 90) return 'bg-indigo-300 text-indigo-900 font-bold';
    return 'bg-indigo-600 text-white font-extrabold shadow-xs';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xs overflow-hidden h-full flex flex-col relative select-none">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div>
          <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
            Inbound Vol. by Time & Weekday
          </h2>
          <p className="text-[10px] text-gray-400 mt-0.5">
            Heatmap showing busiest ticket submission periods
          </p>
        </div>
      </div>

      {/* Grid Container */}
      <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
        {/* Weekday columns header */}
        <div className="grid grid-cols-[50px_repeat(7,_1fr)] gap-1 mb-1 text-center">
          <div /> {/* spacing for time column */}
          {days.map((day, idx) => (
            <div key={idx} className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap rows */}
        <div className="flex flex-col gap-1">
          {hours.map((hour) => {
            const timeLabel = `${hour.toString().padStart(2, '0')}:00`;

            return (
              <div key={hour} className="grid grid-cols-[50px_repeat(7,_1fr)] gap-1 items-center">
                {/* Time label */}
                <div className="text-[9px] font-mono text-gray-400 text-right pr-2">
                  {timeLabel}
                </div>

                {/* Heatmap cells */}
                {days.map((_, dayIdx) => {
                  const cell = getCellData(dayIdx, hour);
                  return (
                    <div
                      key={dayIdx}
                      onMouseEnter={() => setHoveredCell(cell)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-7 flex items-center justify-center text-[10px] rounded-xs transition-all duration-150 cursor-pointer ${getCellClasses(
                        cell.count
                      )} hover:scale-[1.08] hover:shadow-xs hover:z-10`}
                    >
                      {cell.count > 0 ? cell.count : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Heatmap Legend */}
        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-3 text-[9px] text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <span>Low Intake</span>
            <div className="flex gap-0.5">
              <span className="w-2.5 h-2.5 bg-gray-50 border border-gray-100 rounded-2xs" />
              <span className="w-2.5 h-2.5 bg-blue-50 border border-blue-100 rounded-2xs" />
              <span className="w-2.5 h-2.5 bg-blue-100 rounded-2xs" />
              <span className="w-2.5 h-2.5 bg-blue-200 rounded-2xs" />
              <span className="w-2.5 h-2.5 bg-indigo-300 rounded-2xs" />
              <span className="w-2.5 h-2.5 bg-indigo-600 rounded-2xs" />
            </div>
            <span>Peak Hour</span>
          </div>
          <span>Values indicate tickets</span>
        </div>
      </div>

      {/* Tooltip Overlay */}
      {hoveredCell && (
        <div className="absolute top-2 right-5 bg-slate-900 text-white rounded-lg px-2 py-1 text-[9px] shadow-sm pointer-events-none animate-fade-in z-20 border border-slate-800">
          <span className="font-semibold">{days[hoveredCell.day]} at {hoveredCell.hour.toString().padStart(2, '0')}:00: </span>
          <span className="text-blue-300 font-bold">{hoveredCell.count} new tickets</span>
        </div>
      )}
    </div>
  );
}
