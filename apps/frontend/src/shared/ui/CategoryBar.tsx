// ── CategoryBar ───────────────────────────────────────────
// Horizontal bar chart row — label + progress bar + value

interface CategoryBarProps {
  label:   string;
  value:   number;
  max:     number;
  color:   string; // tailwind bg e.g. "bg-blue-400"
}

export function CategoryBar({ label, value, max, color }: CategoryBarProps) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-500 w-14 text-right shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-medium text-gray-700 w-5 shrink-0">{value}</span>
    </div>
  );
}
