import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { StatsOutput } from '../schemas/tools.js';

export function registerStatsTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_stats',
    'Get database statistics and overview',
    {
      domain: z.string().optional().describe('Get stats for specific domain'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { domain } = args;

        const stats = context.storage.getStats(domain);
        const vectorStats = await context.vectorSearch.getStats();

        const output: StatsOutput = {
          total_observations: stats.total_observations,
          observations_by_status: stats.observations_by_status,
          observations_by_category: stats.observations_by_category,
          domains_count: stats.domains_count,
          top_domains: stats.top_domains,
          confirmations: {
            pending: stats.observations_by_status['pending'] ?? 0,
            confirmed: stats.observations_by_status['confirmed'] ?? 0,
            contradicted: stats.observations_by_status['contradicted'] ?? 0,
            stale: stats.observations_by_status['stale'] ?? 0,
          },
          vector_index_size: vectorStats?.points_count,
        };

        context.logger.debug(`Stats: ${stats.total_observations} total observations`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Stats failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
