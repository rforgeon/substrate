import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';

export function registerDomainResource(server: McpServer, context: SubstrateContext): void {
  server.resource(
    'substrate://domain/{domain}',
    'Observations for a specific domain',
    async (uri) => {
      try {
        // Extract domain from URI
        const match = uri.href.match(/substrate:\/\/domain\/(.+)/);
        if (!match) {
          return {
            contents: [{
              uri: uri.href,
              mimeType: 'application/json',
              text: JSON.stringify({ error: 'Invalid domain URI' }),
            }],
          };
        }

        const domain = decodeURIComponent(match[1]!);
        const observations = context.storage.query({
          domain,
          limit: 100,
        });

        const stats = context.storage.getStats(domain);

        const content = {
          domain,
          observations,
          stats: {
            total: stats.total_observations,
            by_status: stats.observations_by_status,
            by_category: stats.observations_by_category,
          },
        };

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2),
          }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Domain resource failed:', message);

        return {
          contents: [{
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify({ error: message }),
          }],
        };
      }
    }
  );
}
