import { randomUUID } from 'node:crypto';

/**
 * Generate a unique observation ID (UUID v4)
 */
export function generateObservationId(): string {
  return randomUUID();
}

/**
 * Generate a unique vector point ID for Qdrant
 * Uses UUID v4 format which Qdrant accepts
 */
export function generateVectorId(): string {
  return randomUUID();
}

/**
 * Generate a sync batch ID
 */
export function generateSyncBatchId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomUUID().slice(0, 8);
  return `sync_${timestamp}_${random}`;
}
