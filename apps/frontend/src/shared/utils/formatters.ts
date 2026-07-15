// ── Display formatters ───────────────────────────────────
// Pure functions that convert raw data into human-readable strings
// Used across features — dashboard, ticket detail, notifications, etc.

/**
 * Converts a raw CUID into a readable ticket number
 * e.g. "cm5x8k9f30001..." → "TICKET-4821"
 *
 * The 4-digit number is derived from the ID using a hash,
 * so the same ticket always shows the same number.
 * The actual database ID (CUID) stays unchanged.
 */
export function formatTicketId(id: string | number): string {
  if (!id) return '';
  const strId = String(id);
  // If the ID is already formatted (starts with TICKET-), prepend #
  if (strId.startsWith('TICKET-')) {
    return `#${strId}`;
  }
  // Extract number from ID and pad to 4 digits
  const numericId = parseInt(strId.replace(/[^\d]/g, ''), 10);
  if (isNaN(numericId)) {
    return `#TICKET-${strId}`;
  }
  return `#TICKET-${String(numericId).padStart(4, '0')}`;
}

/**
 * Converts an ISO date string to a relative time string
 * e.g. "2026-06-30T01:00:00Z" → "2h ago"
 *
 * Keeps tables and lists scannable — users don't need exact timestamps
 */
export function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60)    return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)    return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)      return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
