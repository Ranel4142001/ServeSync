// ── ActivityItem ──────────────────────────────────────────
// Single row in an activity feed — colored dot + text + timestamp

interface ActivityItemProps {
  text:      React.ReactNode;
  time:      string;
  dotColor?: string;  // tailwind bg color e.g. "bg-green-500"
}

export function ActivityItem({ text, time, dotColor = 'bg-blue-400' }: ActivityItemProps) {
  return (
    <div className="flex gap-2.5 px-3.5 py-2.5 border-b border-gray-100 last:border-none items-start">
      <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${dotColor}`} />
      <div>
        <p className="text-[11px] text-gray-700 leading-snug">{text}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
