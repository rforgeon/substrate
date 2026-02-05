import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { SearchOutput, SearchResult } from '../schemas/tools.js';

export function registerSearchTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_search',
    'Semantic search for observations using natural language queries. This is the primary search method.',
    {
      query: z.string().describe('Natural language query for semantic search'),
      domain: z.string().optional().describe('Filter results to specific domain'),
      category: z.enum(['behavior', 'error', 'auth', 'rate_limit', 'format']).optional().describe('Filter by category'),
      status: z.enum(['pending', 'confirmed', 'contradicted', 'stale']).optional().describe('Filter by confirmation status'),
      min_confidence: z.number().min(0).max(1).optional().describe('Minimum confidence threshold'),
      limit: z.number().min(1).max(50).default(10).describe('Maximum results to return'),
    },
    async (args): Promise<{ content: Array<{ type: 'text'; text: string }> }> => {
      try {
        const { query, domain, category, status, min_confidence, limit } = args;

        // Check if vector search is available
        if (!context.vectorSearch.isAvailable()) {
          // Fallback to text-based search in SQLite
          context.logger.warn('Vector search not available, falling back to SQLite query');

          const observations = context.storage.query({
            domain,
            category,
            status,
            limit,
          });

          // Simple text matching fallback
          const filtered = observations.filter(obs => {
            if (min_confidence !== undefined && obs.confidence < min_confidence) {
              return false;
            }
            const searchText = `${obs.domain} ${obs.path ?? ''} ${obs.summary}`.toLowerCase();
            return query.toLowerCase().split(' ').some(word => searchText.includes(word));
          });

          const results: SearchResult[] = filtered.map(obs => ({
            ...obs,
            score: 0.5, // Placeholder score for fallback
          }));

          const output: SearchOutput = {
            results,
            query_embedding_time_ms: 0,
            search_time_ms: 0,
          };

          return {
            content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
          };
        }

        // Perform vector search
        const { results: vectorResults, embedding_time_ms, search_time_ms } = await context.vectorSearch.search(
          query,
          {
            domain,
            category,
            status,
            min_confidence,
            limit,
          }
        );

        // Fetch full observation data for results
        const results: SearchResult[] = [];
        for (const result of vectorResults) {
          const observation = context.storage.get(result.observation_id);
          if (observation) {
            results.push({
              ...observation,
              score: result.score,
            });
          }
        }

        const output: SearchOutput = {
          results,
          query_embedding_time_ms: embedding_time_ms,
          search_time_ms,
        };

        context.logger.debug(`Search: "${query}" returned ${results.length} results in ${embedding_time_ms + search_time_ms}ms`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Search failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
