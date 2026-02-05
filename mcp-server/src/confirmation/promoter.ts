import type { Storage } from '../storage/index.js';
import type { ConfirmationConfig } from '../schemas/config.js';
import type { ObservationStatus } from '../schemas/observation.js';
import type { VectorSearch } from '../vector/index.js';

export interface PromotionResult {
  promoted: boolean;
  newStatus: ObservationStatus;
  newConfidence: number;
  message: string;
}

/**
 * Handles promotion of observations based on confirmation counts
 */
export class Promoter {
  private storage: Storage;
  private config: ConfirmationConfig;
  private vectorSearch: VectorSearch | null;

  constructor(storage: Storage, config: ConfirmationConfig, vectorSearch?: VectorSearch) {
    this.storage = storage;
    this.config = config;
    this.vectorSearch = vectorSearch ?? null;
  }

  /**
   * Calculate confidence based on confirmation count
   * confidence = min(1.0, confirmations / (threshold * 2))
   */
  calculateConfidence(confirmations: number): number {
    return Math.min(1.0, confirmations / this.config.confidence_factor);
  }

  /**
   * Check and promote observation based on confirmation count
   */
  async checkAndPromote(
    groupId: number,
    uniqueAgentCount: number,
    canonicalObservationId: string
  ): Promise<PromotionResult> {
    const observation = this.storage.get(canonicalObservationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: 'pending',
        newConfidence: 0,
        message: 'Observation not found',
      };
    }

    const newConfidence = this.calculateConfidence(uniqueAgentCount);
    const shouldPromote = uniqueAgentCount >= this.config.threshold;

    let newStatus: ObservationStatus = observation.status;

    if (shouldPromote && observation.status === 'pending') {
      newStatus = 'confirmed';
    }

    // Update observation
    this.storage.update(canonicalObservationId, {
      status: newStatus,
      confirmations: uniqueAgentCount,
      confidence: newConfidence,
    });

    // Update confirmation group
    this.storage.updateConfirmationGroup(groupId, {
      status: newStatus,
      confidence: newConfidence,
    });

    // Update vector payload if available
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: newStatus,
        confidence: newConfidence,
      });
    }

    const promoted = newStatus === 'confirmed' && observation.status === 'pending';

    return {
      promoted,
      newStatus,
      newConfidence,
      message: promoted
        ? `Observation promoted to confirmed (${uniqueAgentCount} unique agents)`
        : `Observation updated (${uniqueAgentCount}/${this.config.threshold} confirmations)`,
    };
  }

  /**
   * Manually confirm an observation (admin action)
   */
  async manualConfirm(observationId: string, reason?: string): Promise<PromotionResult> {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: 'pending',
        newConfidence: 0,
        message: 'Observation not found',
      };
    }

    this.storage.update(observationId, {
      status: 'confirmed',
      confidence: 1.0,
    });

    // Update vector payload if available
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: 'confirmed',
        confidence: 1.0,
      });
    }

    return {
      promoted: true,
      newStatus: 'confirmed',
      newConfidence: 1.0,
      message: reason ? `Manually confirmed: ${reason}` : 'Manually confirmed by admin',
    };
  }

  /**
   * Mark an observation as stale
   */
  async markStale(observationId: string, reason?: string): Promise<PromotionResult> {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: 'pending',
        newConfidence: 0,
        message: 'Observation not found',
      };
    }

    this.storage.update(observationId, {
      status: 'stale',
    });

    // Update vector payload if available
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: 'stale',
      });
    }

    return {
      promoted: false,
      newStatus: 'stale',
      newConfidence: observation.confidence,
      message: reason ? `Marked stale: ${reason}` : 'Marked as stale',
    };
  }

  /**
   * Reject an observation (mark as contradicted)
   */
  async reject(observationId: string, reason?: string): Promise<PromotionResult> {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: 'pending',
        newConfidence: 0,
        message: 'Observation not found',
      };
    }

    this.storage.update(observationId, {
      status: 'contradicted',
      confidence: 0,
    });

    // Update vector payload if available
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: 'contradicted',
        confidence: 0,
      });
    }

    return {
      promoted: false,
      newStatus: 'contradicted',
      newConfidence: 0,
      message: reason ? `Rejected: ${reason}` : 'Rejected',
    };
  }
}
