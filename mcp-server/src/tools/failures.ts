import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { FailuresOutput } from '../schemas/tools.js';

export function registerFailuresTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_failures',
    'List recent failure signals (high/critical urgency errors)',
    {
      domain: z.string().optional().describe('Filter to specific domain'),
      since: z.string().optional().describe('Filter to failures after this ISO timestamp'),
      limit: z.number().min(1).max(100).default(20).describe('Maximum results to return'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { domain, since, limit } = args;

        const failures = context.storage.getFailures({
          domain,
          since,
          limit,
        });

        const output: FailuresOutput = {
          failures,
          total_count: failures.length,
        };

        context.logger.debug(`Failures: returned ${failures.length} results`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Failures lookup failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
