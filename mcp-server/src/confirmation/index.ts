import { Aggregator, type AggregationResult } from './aggregator.js';
import { Promoter, type PromotionResult } from './promoter.js';
import { ContradictionDetector, type ContradictionResult } from './contradiction.js';
import { FuzzyMatcher } from './fuzzy-matcher.js';
import type { Storage } from '../storage/index.js';
import type { StoredObservation, ObservationStatus } from '../schemas/observation.js';
import type { ConfirmationConfig } from '../schemas/config.js';
import type { VectorSearch } from '../vector/index.js';

export interface ProcessObservationResult {
  aggregation: AggregationResult;
  promotion: PromotionResult;
  contradiction: ContradictionResult;
}

/**
 * N-confirmation engine that coordinates aggregation, promotion, and contradiction detection
 */
export class ConfirmationEngine {
  private aggregator: Aggregator;
  private promoter: Promoter;
  private contradictionDetector: ContradictionDetector;
  private fuzzyMatcher: FuzzyMatcher | null = null;
  private config: ConfirmationConfig;

  constructor(
    storage: Storage,
    config: ConfirmationConfig,
    vectorSearch?: VectorSearch
  ) {
    this.config = config;
    this.aggregator = new Aggregator(storage, config);
    this.promoter = new Promoter(storage, config, vectorSearch);
    this.contradictionDetector = new ContradictionDetector(storage, config);

    if (vectorSearch) {
      this.fuzzyMatcher = new FuzzyMatcher(vectorSearch);
    }
  }

  /**
   * Process a new observation through the confirmation pipeline
   */
  async processObservation(observation: StoredObservation): Promise<ProcessObservationResult> {
    // Step 1: Detect contradictions
    const contradiction = this.contradictionDetector.detectContradictions(observation);

    // If contradictions found, mark old observations
    if (contradiction.hasContradiction) {
      this.contradictionDetector.markAsContradicted(contradiction.contradictingObservations);
    }

    // Step 2: Aggregate with existing observations
    const aggregation = this.aggregator.aggregate(observation);

    // Step 3: Check for promotion
    const promotion = await this.promoter.checkAndPromote(
      aggregation.groupId,
      aggregation.uniqueAgentCount,
      aggregation.canonicalObservationId
    );

    return {
      aggregation,
      promotion,
      contradiction,
    };
  }

  /**
   * Manually confirm an observation (admin action)
   */
  async manualConfirm(observationId: string, reason?: string): Promise<PromotionResult> {
    return this.promoter.manualConfirm(observationId, reason);
  }

  /**
   * Manually reject an observation
   */
  async reject(observationId: string, reason?: string): Promise<PromotionResult> {
    return this.promoter.reject(observationId, reason);
  }

  /**
   * Mark an observation as stale
   */
  async markStale(observationId: string, reason?: string): Promise<PromotionResult> {
    return this.promoter.markStale(observationId, reason);
  }

  /**
   * Get content hash for an observation
   */
  getContentHash(observation: StoredObservation): string {
    return this.aggregator.getContentHash(observation);
  }

  /**
   * Get the confirmation threshold
   */
  getThreshold(): number {
    return this.config.threshold;
  }

  /**
   * Calculate confidence for a given confirmation count
   */
  calculateConfidence(confirmations: number): number {
    return this.promoter.calculateConfidence(confirmations);
  }

  /**
   * v0.3: Find fuzzy matches for an observation
   */
  async findFuzzyMatch(observation: StoredObservation): Promise<{ matched: boolean; matchedId: string | null; similarity: number }> {
    if (!this.fuzzyMatcher) {
      return { matched: false, matchedId: null, similarity: 0 };
    }

    const result = await this.fuzzyMatcher.findMatch(observation);
    return {
      matched: result.matched,
      matchedId: result.matchedObservationId,
      similarity: result.similarity,
    };
  }
}

export { Aggregator } from './aggregator.js';
export { Promoter } from './promoter.js';
export { ContradictionDetector } from './contradiction.js';
export { FuzzyMatcher } from './fuzzy-matcher.js';
export type { AggregationResult, PromotionResult, ContradictionResult };
