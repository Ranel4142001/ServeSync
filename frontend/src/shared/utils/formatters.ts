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

  // If already starts with #TICKET- or TICKET-, format it cleanly
  if (strId.startsWith('#TICKET-')) return strId;
  if (strId.startsWith('TICKET-')) return `#${strId}`;

  let datePart = '20260715';
  let suffixPart = '042';

  const cleanId = strId.replace(/-/g, '');
  if (cleanId.length >= 32) {
    // Decode timestamp from the first 12 hex characters of UUID v7
    const hexTime = cleanId.slice(0, 12);
    const timeMs = parseInt(hexTime, 16);
    if (!isNaN(timeMs) && timeMs > 1500000000000 && timeMs < 2500000000000) {
      const date = new Date(timeMs);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      datePart = `${yyyy}${mm}${dd}`;
    }
    
    const charCodeSum = Array.from(cleanId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
    suffixPart = String(charCodeSum % 1000).padStart(3, '0');
  } else {
    // Fallback for numeric/other IDs
    const numericId = parseInt(cleanId.replace(/[^\d]/g, ''), 10);
    if (!isNaN(numericId)) {
      suffixPart = String(numericId % 1000).padStart(3, '0');
    }
  }

  return `#TICKET-${datePart}${suffixPart}`;
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

/**
 * Converts an organization UUID into a stable formatted ID
 * e.g. "019f65df-..." → "ORG-2026071542"
 */
export function formatOrgId(id: string | null): string {
  if (!id) return 'ORG-2026071542';
  const cleanId = id.replace(/-/g, '');
  
  let datePart = '20260715';
  if (cleanId.length >= 12) {
    const hexTime = cleanId.slice(0, 12);
    const timeMs = parseInt(hexTime, 16);
    if (!isNaN(timeMs) && timeMs > 1500000000000 && timeMs < 2500000000000) {
      const date = new Date(timeMs);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      datePart = `${yyyy}${mm}${dd}`;
    }
  }
  
  let suffix = '42';
  const charCodeSum = Array.from(cleanId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  suffix = String(charCodeSum % 100).padStart(2, '0');
  
  return `ORG-${datePart}${suffix}`;
}
