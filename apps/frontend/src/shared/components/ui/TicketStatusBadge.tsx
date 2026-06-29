// ── TicketStatusBadge ─────────────────────────────────────
const statusStyles: Record<string, string> = {
  OPEN:        'bg-blue-50 text-blue-800',
  IN_PROGRESS: 'bg-yellow-50 text-yellow-800',
  RESOLVED:    'bg-green-50 text-green-800',
  CLOSED:      'bg-gray-100 text-gray-600',
};

const statusLabels: Record<string, string> = {
  OPEN:        'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
};

export function TicketStatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold ${statusStyles[status] ?? statusStyles.OPEN}`}>
      {statusLabels[status] ?? status}
    </span>
  );
}
