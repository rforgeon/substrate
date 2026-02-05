import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { SubstrateContext } from '../server.js';
import type { SemanticSearchOutput, SearchResult } from '../schemas/tools.js';

export function registerSemanticSearchTool(server: McpServer, context: SubstrateContext): void {
  server.tool(
    'substrate_semantic_search',
    'Explicit semantic search alias - searches observations using vector similarity',
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

        // This is an explicit semantic search - require vector search
        if (!context.vectorSearch.isAvailable()) {
          return {
            content: [{
              type: 'text',
              text: JSON.stringify({
                error: 'Semantic search requires Qdrant. Please start Qdrant: docker run -p 6333:6333 qdrant/qdrant',
                fallback_hint: 'Use substrate_lookup for exact domain/path matching instead',
              }, null, 2),
            }],
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

        const output: SemanticSearchOutput = {
          results,
          query_embedding_time_ms: embedding_time_ms,
          search_time_ms,
        };

        context.logger.debug(`Semantic search: "${query}" returned ${results.length} results`);

        return {
          content: [{ type: 'text', text: JSON.stringify(output, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        context.logger.error('Semantic search failed:', message);

        return {
          content: [{ type: 'text', text: JSON.stringify({ error: message }, null, 2) }],
        };
      }
    }
  );
}
