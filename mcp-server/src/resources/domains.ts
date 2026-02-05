import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';

export function registerDomainsResource(server: McpServer, context: SubstrateContext): void {
  server.resource(
    'substrate://domains',
    'List of all observed domains with observation counts',
    async () => {
      try {
        const domains = context.storage.getAllDomains();

        const content = {
          domains: domains.map(d => ({
            domain: d.domain,
            observation_count: d.count,
          })),
          total_domains: domains.length,
        };

        return {
          contents: [{
            uri: 'substrate://domains',
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2),
          }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Domains resource failed:', message);

        return {
          contents: [{
            uri: 'substrate://domains',
            mimeType: 'application/json',
            text: JSON.stringify({ error: message }),
          }],
        };
      }
    }
  );
}
