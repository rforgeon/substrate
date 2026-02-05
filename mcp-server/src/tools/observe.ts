import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import { ObserveInput, type ObserveOutput } from '../schemas/tools.js';
import type { StoredObservation } from '../schemas/observation.js';
import { generateObservationId } from '../utils/id-generator.js';
import { generateContentHash } from '../utils/hash.js';

export function registerObserveTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_observe',
    'Record an observation about an interface, API, or webpage for future agents',
    {
      domain: z.string().describe('The domain being observed (e.g., "api.example.com")'),
      path: z.string().optional().describe('The specific path or endpoint (e.g., "/v2/checkout")'),
      category: z.enum(['behavior', 'error', 'auth', 'rate_limit', 'format']).describe('Category of observation'),
      summary: z.string().describe('Human-readable description of the observation'),
      structured_data: z.record(z.unknown()).optional().describe('Structured data relevant to the category'),
      urgency: z.enum(['normal', 'high', 'critical']).optional().describe('Urgency level for sync prioritization'),
      tags: z.array(z.string()).optional().describe('Tags for filtering and organization'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const input = ObserveInput.parse(args);
        const now = new Date().toISOString();

        // Generate content hash for deduplication
        const contentHash = generateContentHash(
          input.domain,
          input.path,
          input.category,
          input.structured_data
        );

        // Check for existing observation with same content hash
        const existing = context.storage.query({
          domain: input.domain,
          path: input.path,
          category: input.category,
          limit: 1,
        }).find(obs => (obs as StoredObservation).content_hash === contentHash);

        if (existing) {
          // Process through confirmation engine (adds confirmation)
          const result = await context.confirmationEngine.processObservation(existing as StoredObservation);

          const output: ObserveOutput = {
            success: true,
            observation_id: existing.id,
            message: result.promotion.message,
            matched_existing: true,
            new_confirmation_count: result.aggregation.totalConfirmations,
          };

          return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          };
        }

        // Create new observation
        const observation: StoredObservation = {
          id: generateObservationId(),
          agent_hash: context.agentHash,
          domain: input.domain,
          path: input.path,
          category: input.category,
          summary: input.summary,
          structured_data: input.structured_data,
          status: 'pending',
          confirmations: 1,
          confirming_agents: [context.agentHash],
          confidence: 0,
          urgency: input.urgency ?? 'normal',
          tags: input.tags ?? [],
          content_hash: contentHash,
          created_at: now,
          updated_at: now,
        };

        // Store observation
        context.storage.insert(observation);

        // Index in vector search
        const vectorId = await context.vectorSearch.index(observation);
        if (vectorId) {
          context.storage.update(observation.id, { vector_id: vectorId });
          observation.vector_id = vectorId;
        }

        // Process through confirmation engine
        const result = await context.confirmationEngine.processObservation(observation);

        // Export for sync
        context.syncCoordinator.exportObservation(observation);

        const output: ObserveOutput = {
          success: true,
          observation_id: observation.id,
          message: `Observation recorded. ${result.promotion.message}`,
          matched_existing: false,
          new_confirmation_count: result.aggregation.totalConfirmations,
        };

        context.logger.info(`Observed: ${input.domain}${input.path ?? ''} [${input.category}]`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Observe failed:', message);

        const output: ObserveOutput = {
          success: false,
          message: `Failed to record observation: ${message}`,
        };

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      }
    }
  );
}
