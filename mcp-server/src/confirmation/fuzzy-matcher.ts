import type { VectorSearch } from '../vector/index.js';
import type { StoredObservation } from '../schemas/observation.js';

export interface FuzzyMatchResult {
  matched: boolean;
  matchedObservationId: string | null;
  similarity: number;
}

/**
 * v0.3: Fuzzy structural matching using vector similarity
 * Groups "similar enough" observations for confirmation
 */
export class FuzzyMatcher {
  private vectorSearch: VectorSearch;
  private similarityThreshold: number;

  constructor(vectorSearch: VectorSearch, similarityThreshold: number = 0.85) {
    this.vectorSearch = vectorSearch;
    this.similarityThreshold = similarityThreshold;
  }

  /**
   * Find a fuzzy match for an observation
   */
  async findMatch(observation: StoredObservation): Promise<FuzzyMatchResult> {
    if (!this.vectorSearch.isAvailable()) {
      return {
        matched: false,
        matchedObservationId: null,
        similarity: 0,
      };
    }

    const searchText = `${observation.domain} ${observation.path ?? ''} ${observation.category} ${observation.summary}`;

    const { results } = await this.vectorSearch.search(searchText, {
      domain: observation.domain,
      category: observation.category,
      limit: 5,
    });

    // Find the best match above threshold
    for (const result of results) {
      // Skip self
      if (result.observation_id === observation.id) continue;

      if (result.score >= this.similarityThreshold) {
        return {
          matched: true,
          matchedObservationId: result.observation_id,
          similarity: result.score,
        };
      }
    }

    return {
      matched: false,
      matchedObservationId: null,
      similarity: results[0]?.score ?? 0,
    };
  }

  /**
   * Set the similarity threshold
   */
  setThreshold(threshold: number): void {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
  }

  /**
   * Get the current similarity threshold
   */
  getThreshold(): number {
    return this.similarityThreshold;
  }
}
