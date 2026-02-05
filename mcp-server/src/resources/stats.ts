import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';

export function registerStatsResource(server: McpServer, context: SubstrateContext): void {
  server.resource(
    'substrate://stats',
    'Overall Substrate network statistics',
    async () => {
      try {
        const stats = context.storage.getStats();
        const vectorStats = await context.vectorSearch.getStats();

        const content = {
          observations: {
            total: stats.total_observations,
            by_status: stats.observations_by_status,
            by_category: stats.observations_by_category,
          },
          domains: {
            total: stats.domains_count,
            top: stats.top_domains.slice(0, 10),
          },
          confirmation: {
            pending: stats.observations_by_status['pending'] ?? 0,
            confirmed: stats.observations_by_status['confirmed'] ?? 0,
            contradicted: stats.observations_by_status['contradicted'] ?? 0,
            stale: stats.observations_by_status['stale'] ?? 0,
            threshold: context.confirmationEngine.getThreshold(),
          },
          vector_search: {
            available: context.vectorSearch.isAvailable(),
            indexed_points: vectorStats?.points_count ?? 0,
          },
          sync: {
            enabled: context.syncCoordinator.isRunning(),
            peers: context.syncCoordinator.getPeers().length,
          },
          generated_at: new Date().toISOString(),
        };

        return {
          contents: [{
            uri: 'substrate://stats',
            mimeType: 'application/json',
            text: JSON.stringify(content, null, 2),
          }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Stats resource failed:', message);

        return {
          contents: [{
            uri: 'substrate://stats',
            mimeType: 'application/json',
            text: JSON.stringify({ error: message }),
          }],
        };
      }
    }
  );
}
