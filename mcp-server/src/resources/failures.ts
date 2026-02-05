import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';

export function registerFailuresResource(server: McpServer, context: SubstrateContext): void {
  server.resource(
    'substrate://failures/recent',
    'Recent failure signals from all domains',
    async () => {
      try {
        // Get failures from last 24 hours
        const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const failures = context.storage.getFailures({
          since,
          limit: 50,
        });

        const content = {
          failures,
          period: '24h',
          total_count: failures.length,
          generated_at: new Date().toISOString(),
        };

        return {
          contents: [{
            uri: 'substrate://failures/recent',
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2),
          }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Failures resource failed:', message);

        return {
          contents: [{
            uri: 'substrate://failures/recent',
            mimeType: 'application/json',
            text: JSON.stringify({ error: message }),
          }],
        };
      }
    }
  );
}
