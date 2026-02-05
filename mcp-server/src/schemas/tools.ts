import { z } from 'zod';
import { ObservationCategory, UrgencyLevel, Observation, ObservationStatus } from './observation.js';

// ============================================================================
// substrate_observe - Record a new observation
// ============================================================================

export const ObserveInput = z.object({
  domain: z.string().min(1).describe('The domain being observed (e.g., "api.example.com")'),
  path: z.string().optional().describe('The specific path or endpoint (e.g., "/v2/checkout")'),
  category: ObservationCategory.describe('Category of observation'),
  summary: z.string().min(1).max(2000).describe('Human-readable description of the observation'),
  structured_data: z.record(z.unknown()).optional().describe('Structured data relevant to the category'),
  urgency: UrgencyLevel.optional().describe('Urgency level for sync prioritization'),
  tags: z.array(z.string()).optional().describe('Tags for filtering and organization'),
});

export type ObserveInput = z.infer<typeof ObserveInput>;

export const ObserveOutput = z.object({
  success: z.boolean(),
  observation_id: z.string().optional(),
  message: z.string(),
  matched_existing: z.boolean().optional(),
  new_confirmation_count: z.number().optional(),
});

export type ObserveOutput = z.infer<typeof ObserveOutput>;

// ============================================================================
// substrate_lookup - Exact lookup by domain/path
// ============================================================================

export const LookupInput = z.object({
  domain: z.string().min(1).describe('Domain to look up'),
  path: z.string().optional().describe('Specific path to filter by'),
  category: ObservationCategory.optional().describe('Filter by category'),
  status: ObservationStatus.optional().describe('Filter by confirmation status'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum results to return'),
});

export type LookupInput = z.infer<typeof LookupInput>;

export const LookupOutput = z.object({
  observations: z.array(Observation),
  total_count: z.number(),
  has_more: z.boolean(),
});

export type LookupOutput = z.infer<typeof LookupOutput>;

// ============================================================================
// substrate_search - Vector semantic search (primary search method)
// ============================================================================

export const SearchInput = z.object({
  query: z.string().min(1).describe('Natural language query for semantic search'),
  domain: z.string().optional().describe('Filter results to specific domain'),
  category: ObservationCategory.optional().describe('Filter by category'),
  status: ObservationStatus.optional().describe('Filter by confirmation status'),
  min_confidence: z.number().min(0).max(1).optional().describe('Minimum confidence threshold'),
  limit: z.number().min(1).max(50).default(10).describe('Maximum results to return'),
});

export type SearchInput = z.infer<typeof SearchInput>;

export const SearchResult = Observation.extend({
  score: z.number().min(0).max(1).describe('Semantic similarity score'),
});

export type SearchResult = z.infer<typeof SearchResult>;

export const SearchOutput = z.object({
  results: z.array(SearchResult),
  query_embedding_time_ms: z.number().optional(),
  search_time_ms: z.number().optional(),
});

export type SearchOutput = z.infer<typeof SearchOutput>;

// ============================================================================
// substrate_failures - List failure signals
// ============================================================================

export const FailuresInput = z.object({
  domain: z.string().optional().describe('Filter to specific domain'),
  since: z.string().datetime().optional().describe('Filter to failures after this timestamp'),
  limit: z.number().min(1).max(100).default(20).describe('Maximum results to return'),
});

export type FailuresInput = z.infer<typeof FailuresInput>;

export const FailuresOutput = z.object({
  failures: z.array(Observation),
  total_count: z.number(),
});

export type FailuresOutput = z.infer<typeof FailuresOutput>;

// ============================================================================
// substrate_confirm - Manual confirmation (admin)
// ============================================================================

export const ConfirmInput = z.object({
  observation_id: z.string().describe('ID of observation to confirm'),
  action: z.enum(['confirm', 'reject', 'mark_stale']).describe('Confirmation action'),
  reason: z.string().optional().describe('Reason for the action'),
});

export type ConfirmInput = z.infer<typeof ConfirmInput>;

export const ConfirmOutput = z.object({
  success: z.boolean(),
  observation_id: z.string(),
  new_status: ObservationStatus,
  new_confidence: z.number(),
  message: z.string(),
});

export type ConfirmOutput = z.infer<typeof ConfirmOutput>;

// ============================================================================
// substrate_stats - Database statistics
// ============================================================================

export const StatsInput = z.object({
  domain: z.string().optional().describe('Get stats for specific domain'),
});

export type StatsInput = z.infer<typeof StatsInput>;

export const StatsOutput = z.object({
  total_observations: z.number(),
  observations_by_status: z.record(z.number()),
  observations_by_category: z.record(z.number()),
  domains_count: z.number(),
  top_domains: z.array(z.object({
    domain: z.string(),
    count: z.number(),
  })),
  confirmations: z.object({
    pending: z.number(),
    confirmed: z.number(),
    contradicted: z.number(),
    stale: z.number(),
  }),
  vector_index_size: z.number().optional(),
  last_sync: z.string().datetime().optional(),
});

export type StatsOutput = z.infer<typeof StatsOutput>;

// ============================================================================
// substrate_semantic_search - Alias for substrate_search (explicit semantic)
// ============================================================================

export const SemanticSearchInput = SearchInput;
export type SemanticSearchInput = SearchInput;

export const SemanticSearchOutput = SearchOutput;
export type SemanticSearchOutput = SearchOutput;
