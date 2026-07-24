// ── TicketPriorityBadge ───────────────────────────────────
const priorityStyles: Record<string, string> = {
  LOW:    'bg-gray-100 text-gray-600',
  MEDIUM: 'bg-blue-50 text-blue-800',
  HIGH:   'bg-yellow-50 text-yellow-800',
  URGENT: 'bg-red-50 text-red-800',
};

export function TicketPriorityBadge({ priority }: { priority: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${priorityStyles[priority] ?? priorityStyles.MEDIUM}`}>
      {priority}
    </span>
  );
}
