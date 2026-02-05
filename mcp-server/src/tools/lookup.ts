import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { LookupOutput } from '../schemas/tools.js';

export function registerLookupTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_lookup',
    'Look up observations by exact domain and optional path match',
    {
      domain: z.string().describe('Domain to look up'),
      path: z.string().optional().describe('Specific path to filter by'),
      category: z.enum(['behavior', 'error', 'auth', 'rate_limit', 'format']).optional().describe('Filter by category'),
      status: z.enum(['pending', 'confirmed', 'contradicted', 'stale']).optional().describe('Filter by confirmation status'),
      limit: z.number().min(1).max(100).default(20).describe('Maximum results to return'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { domain, path, category, status, limit } = args;

        const observations = context.storage.query({
          domain,
          path,
          category,
          status,
          limit: limit + 1, // Fetch one extra to check if there's more
        });

        const hasMore = observations.length > limit;
        const results = hasMore ? observations.slice(0, limit) : observations;

        const output: LookupOutput = {
          observations: results,
          total_count: context.storage.count({ domain, path, category, status }),
          has_more: hasMore,
        };

        context.logger.debug(`Lookup: ${domain}${path ?? ''} returned ${results.length} results`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Lookup failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
