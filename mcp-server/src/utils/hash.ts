import { createHash } from 'node:crypto';

/**
 * Generate SHA-256 hash of a string
 */
export function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

/**
 * Generate a hash of the agent identifier for privacy
 */
export function hashAgentId(agentId: string): string {
  return sha256(`substrate:agent:${agentId}`);
}

/**
 * Recursively sort object keys for consistent JSON serialization
 */
function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

/**
 * Generate a content hash for deduplication and grouping
 * Based on domain, path, category, and structured_data
 */
export function generateContentHash(
  domain: string,
  path: string | undefined,
  category: string,
  structuredData: unknown
): string {
  const canonical = {
    category,
    domain: domain.toLowerCase(),
    path: path?.toLowerCase() ?? '',
    structured_data: sortObjectKeys(structuredData) ?? null,
  };

  return sha256(JSON.stringify(canonical));
}

/**
 * Generate a summary hash for fuzzy matching (v0.3)
 * Normalizes the summary text for comparison
 */
export function generateSummaryHash(summary: string): string {
  const normalized = summary
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
  return sha256(normalized);
}
