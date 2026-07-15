import { randomBytes } from 'crypto';

/**
 * Generates a time-sorted, lexicographically sortable UUID v7.
 * This retains the security of UUID v4 while offering sequential insertion performance.
 */
export function uuidv7(): string {
  const now = Date.now();
  const hexTimestamp = now.toString(16).padStart(12, '0'); // 48 bits (12 hex digits)
  
  const rand = randomBytes(10);
  
  // Set version 7 (0111) in byte 6
  rand[0] = (rand[0] & 0x0f) | 0x70;
  
  // Set variant 1 (10xx) in byte 8
  rand[2] = (rand[2] & 0x3f) | 0x80;
  
  const part3 = rand.slice(0, 2).toString('hex');
  const part4 = rand.slice(2, 4).toString('hex');
  const part5 = rand.slice(4, 10).toString('hex');
  
  return `${hexTimestamp.slice(0, 8)}-${hexTimestamp.slice(8, 12)}-${part3}-${part4}-${part5}`;
}

/**
 * Transforms an internal database UUID string ID into the public string format.
 * With UUIDs, the internal ID is already secure, so we return it directly.
 */
export function encodeId(type: 'org' | 'ticket' | 'inv' | 'user', internalId: string): string {
  if (!internalId) {
    throw new Error(`Invalid internal ID provided for type ${type}`);
  }
  return internalId;
}

/**
 * Reverses public string format back into database UUID.
 * With UUIDs, this is a pass-through.
 */
export function decodeId(publicId: string): string {
  if (!publicId || typeof publicId !== 'string') {
    throw new Error('Public ID must be a valid string');
  }
  return publicId;
}