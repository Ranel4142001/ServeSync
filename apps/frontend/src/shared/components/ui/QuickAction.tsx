// ── QuickAction ───────────────────────────────────────────
// Clickable action button with icon + label

interface QuickActionProps {
  icon:     string;
  label:    string;
  onClick?: () => void;
}

export function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 bg-white text-[11px] font-medium text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all cursor-pointer"
    >
      <i className={`ti ${icon} text-sm`} aria-hidden="true" />
      {label}
    </button>
  );
}
