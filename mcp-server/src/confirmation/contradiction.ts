import type { Storage } from '../storage/index.js';
import type { StoredObservation } from '../schemas/observation.js';
import type { ConfirmationConfig } from '../schemas/config.js';

export interface ContradictionResult {
  hasContradiction: boolean;
  contradictingObservations: string[];
  message: string;
}

/**
 * Detects contradictions between observations
 */
export class ContradictionDetector {
  private storage: Storage;
  private config: ConfirmationConfig;

  constructor(storage: Storage, config: ConfirmationConfig) {
    this.storage = storage;
    this.config = config;
  }

  /**
   * Check for contradictions with existing observations
   * Looks for observations with same domain/path/category but different structured_data
   */
  detectContradictions(observation: StoredObservation): ContradictionResult {
    // Get recent observations for same domain/path/category
    const windowStart = new Date(
      Date.now() - this.config.contradiction_window_hours * 60 * 60 * 1000
    ).toISOString();

    const existing = this.storage.query({
      domain: observation.domain,
      path: observation.path,
      category: observation.category,
      since: windowStart,
      limit: 50,
    });

    const contradictions: string[] = [];

    for (const existing_obs of existing) {
      // Skip self
      if (existing_obs.id === observation.id) continue;

      // Skip already contradicted or stale observations
      if (existing_obs.status === 'contradicted' || existing_obs.status === 'stale') continue;

      // Check if structured data conflicts
      if (this.dataConflicts(observation.structured_data, existing_obs.structured_data)) {
        contradictions.push(existing_obs.id);
      }
    }

    if (contradictions.length > 0) {
      return {
        hasContradiction: true,
        contradictingObservations: contradictions,
        message: `Found ${contradictions.length} potentially contradicting observation(s)`,
      };
    }

    return {
      hasContradiction: false,
      contradictingObservations: [],
      message: 'No contradictions detected',
    };
  }

  /**
   * Mark observations as contradicted
   */
  markAsContradicted(observationIds: string[]): void {
    for (const id of observationIds) {
      this.storage.update(id, {
        status: 'contradicted',
      });
    }
  }

  /**
   * Check if two structured data objects conflict
   */
  private dataConflicts(
    data1: unknown,
    data2: unknown
  ): boolean {
    // If both are null/undefined, no conflict
    if (!data1 && !data2) return false;

    // If one is null/undefined and other isn't, not necessarily a conflict
    if (!data1 || !data2) return false;

    // Both must be objects
    if (typeof data1 !== 'object' || typeof data2 !== 'object') return false;

    const obj1 = data1 as Record<string, unknown>;
    const obj2 = data2 as Record<string, unknown>;

    // Check for conflicting values on same keys
    for (const key of Object.keys(obj1)) {
      if (key in obj2) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        // Skip undefined/null values
        if (val1 === undefined || val1 === null) continue;
        if (val2 === undefined || val2 === null) continue;

        // Different non-null values = conflict
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          return true;
        }
      }
    }

    return false;
  }
}
