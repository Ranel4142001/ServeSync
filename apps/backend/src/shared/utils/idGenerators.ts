// Pure ID-formatting and parsing helpers — no database access here
// Reusable by any repository, controller, or use case

/**
 * Transforms an internal database integer ID into your custom UI string formats.
 */
export function encodeId(type: 'org' | 'ticket' | 'inv' | 'user', internalId: number): string {
  if (!internalId || isNaN(internalId)) {
    throw new Error(`Invalid internal ID provided for type ${type}`);
  }

  switch (type) {
    case 'org':
      return `ORG-${String(internalId).padStart(4, '0')}`;
    case 'ticket':
      return `TICKET-${String(internalId).padStart(4, '0')}`;
    case 'user':
      return `USER-${String(internalId).padStart(4, '0')}`; // Handles clients/agents
    case 'inv': {
      const currentYear = 2026; 
      return `INV-${currentYear}-${String(internalId).padStart(5, '0')}`;
    }
    default:
      throw new Error(`Invalid model type provided to encodeId: ${type}`);
  }
}

/**
 * Reverses your custom UI string formats back into an internal database integer.
 * Handles patterns like "ORG-0012", "TICKET-0154", and "INV-2026-00045"
 */
export function decodeId(publicId: string): number {
  if (!publicId || typeof publicId !== 'string') {
    throw new Error('Public ID must be a valid string');
  }

  const parts = publicId.split('-');
  
  // No matter the prefix or structure, the actual integer is always the last segment
  const rawId = parts[parts.length - 1]; 
  const internalId = parseInt(rawId, 10);
  
  if (isNaN(internalId)) {
    throw new Error(`Invalid public ID structure: ${publicId}`);
  }
  
  return internalId;
}