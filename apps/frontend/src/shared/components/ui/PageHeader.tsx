// ── PageHeader ───────────────────────────────────────────
// Reusable header bar for list pages (tickets, users, invoices, etc.)
// Shows: title + optional count badge + optional action button
//
// Usage:
//   <PageHeader title="All tickets" count={248} action={<button>Create</button>} />

interface PageHeaderProps {
  title:        string;
  count?:       number;            // shows a count badge next to the title
  description?: string;            // optional subtitle text
  action?:      React.ReactNode;   // right-side action (e.g. a button)
}

export function PageHeader({ title, count, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {count !== undefined && (
            <span className="bg-gray-100 text-gray-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
