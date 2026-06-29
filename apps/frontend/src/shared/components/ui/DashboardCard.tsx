// ── Card ──────────────────────────────────────────────────
// Dashboard-specific card with optional header (title + action)
// Different from the simpler shared Card — this one has header slot

interface CardProps {
  title?:     string;
  action?:    React.ReactNode;
  children:   React.ReactNode;
  className?: string;
}

export function Card({ title, action, children, className = '' }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between px-3.5 py-3 border-b border-gray-100">
          {title && <h2 className="text-xs font-semibold text-gray-900">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
