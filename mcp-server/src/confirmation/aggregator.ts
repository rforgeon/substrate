import type { Storage } from '../storage/index.js';
import type { StoredObservation } from '../schemas/observation.js';
import type { ConfirmationConfig } from '../schemas/config.js';
import { generateContentHash } from '../utils/hash.js';

export interface AggregationResult {
  isNew: boolean;
  groupId: number;
  canonicalObservationId: string;
  totalConfirmations: number;
  uniqueAgentCount: number;
}

/**
 * Groups observations by their content for confirmation tracking
 */
export class Aggregator {
  private storage: Storage;
  private config: ConfirmationConfig;

  constructor(storage: Storage, config: ConfirmationConfig) {
    this.storage = storage;
    this.config = config;
  }

  /**
   * Process a new observation and aggregate it with existing similar observations
   */
  aggregate(observation: StoredObservation): AggregationResult {
    const contentHash = generateContentHash(
      observation.domain,
      observation.path,
      observation.category,
      observation.structured_data
    );

    // Look for existing confirmation group
    const existingGroup = this.storage.findConfirmationGroup(
      observation.domain,
      observation.path,
      observation.category,
      contentHash
    );

    if (existingGroup) {
      // Check if this agent has already confirmed
      if (existingGroup.unique_agents.includes(observation.agent_hash)) {
        // Same agent, same observation - no additional confirmation
        return {
          isNew: false,
          groupId: existingGroup.id,
          canonicalObservationId: existingGroup.canonical_observation_id,
          totalConfirmations: existingGroup.total_confirmations,
          uniqueAgentCount: existingGroup.unique_agents.length,
        };
      }

      // New agent confirming existing observation
      const newAgents = [...existingGroup.unique_agents, observation.agent_hash];
      const newConfirmations = existingGroup.total_confirmations + 1;

      this.storage.updateConfirmationGroup(existingGroup.id, {
        total_confirmations: newConfirmations,
        unique_agents: newAgents,
      });

      return {
        isNew: false,
        groupId: existingGroup.id,
        canonicalObservationId: existingGroup.canonical_observation_id,
        totalConfirmations: newConfirmations,
        uniqueAgentCount: newAgents.length,
      };
    }

    // Create new confirmation group
    const newGroup = this.storage.createConfirmationGroup(
      observation.domain,
      observation.path,
      observation.category,
      contentHash,
      observation.id,
      observation.agent_hash
    );

    return {
      isNew: true,
      groupId: newGroup.id,
      canonicalObservationId: observation.id,
      totalConfirmations: 1,
      uniqueAgentCount: 1,
    };
  }

  /**
   * Get the content hash for an observation
   */
  getContentHash(observation: StoredObservation): string {
    return generateContentHash(
      observation.domain,
      observation.path,
      observation.category,
      observation.structured_data
    );
  }
}
