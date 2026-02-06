import { z } from 'zod';

// Observation categories
export const ObservationCategory = z.enum([
  'behavior',    // UI/UX patterns, workflows, interactions
  'error',       // Error messages, failure modes
  'auth',        // Authentication requirements, session handling
  'rate_limit',  // Rate limiting, throttling, quotas
  'format',      // Data formats, validation rules, encoding
]);

export type ObservationCategory = z.infer<typeof ObservationCategory>;

// Status of an observation in the confirmation workflow
export const ObservationStatus = z.enum([
  'pending',     // Initial state, awaiting confirmations
  'confirmed',   // Met confirmation threshold
  'contradicted', // Conflicting observations detected
  'stale',       // Marked as outdated
]);

export type ObservationStatus = z.infer<typeof ObservationStatus>;

// Urgency level for sync prioritization
export const UrgencyLevel = z.enum([
  'normal',      // Standard sync interval
  'high',        // Priority sync
  'critical',    // Immediate sync (failures, auth changes)
]);

export type UrgencyLevel = z.infer<typeof UrgencyLevel>;

// Structured data varies by category
export const BehaviorData = z.object({
  element: z.string().optional(),
  action: z.string().optional(),
  expected_result: z.string().optional(),
  actual_result: z.string().optional(),
  workaround: z.string().optional(),
});

export const ErrorData = z.object({
  error_code: z.string().optional(),
  error_message: z.string().optional(),
  trigger: z.string().optional(),
  resolution: z.string().optional(),
  recoverable: z.boolean().optional(),
});

export const AuthData = z.object({
  method: z.string().optional(),         // oauth, api_key, session, etc.
  header: z.string().optional(),          // X-Api-Key, Authorization, etc.
  token_location: z.string().optional(), // header, cookie, query
  session_duration: z.string().optional(),
  refresh_mechanism: z.string().optional(),
});

export const RateLimitData = z.object({
  limit: z.number().optional(),
  window: z.string().optional(),         // "1m", "1h", "1d"
  header_remaining: z.string().optional(),
  header_reset: z.string().optional(),
  retry_after: z.string().optional(),
});

export const FormatData = z.object({
  field: z.string().optional(),
  format: z.string().optional(),         // "DD/MM/YYYY", "ISO8601", etc.
  validation_regex: z.string().optional(),
  encoding: z.string().optional(),
  max_length: z.number().optional(),
  required: z.boolean().optional(),
});

// Union of all structured data types
// Use passthrough to preserve unknown keys when parsing through typed schemas
export const StructuredData = z.union([
  BehaviorData.passthrough(),
  ErrorData.passthrough(),
  AuthData.passthrough(),
  RateLimitData.passthrough(),
  FormatData.passthrough(),
  z.record(z.unknown()), // Allow arbitrary data for flexibility
]);

export type StructuredData = z.infer<typeof StructuredData>;

// Impact metrics - estimated by the observing agent
export const ImpactEstimate = z.object({
  time_saved_seconds: z.number().min(0).optional(),      // Estimated seconds saved
  success_rate_improvement: z.number().min(0).max(100).optional(), // % improvement (0-100)
  reasoning: z.string().optional(),                       // Why this estimate
});

export type ImpactEstimate = z.infer<typeof ImpactEstimate>;

// Impact report - reported by an agent that used the advice
export const ImpactReport = z.object({
  agent_hash: z.string(),
  actual_time_saved_seconds: z.number().optional(),
  task_succeeded: z.boolean().optional(),
  helpful: z.boolean(),                                   // Was this advice helpful?
  feedback: z.string().optional(),                        // Optional feedback
  reported_at: z.string().datetime(),
});

export type ImpactReport = z.infer<typeof ImpactReport>;

// Aggregated impact statistics
export const ImpactStats = z.object({
  total_uses: z.number().default(0),                      // Times this advice was used
  helpful_count: z.number().default(0),                   // Times marked helpful
  avg_time_saved_seconds: z.number().optional(),          // Average actual time saved
  success_rate: z.number().min(0).max(100).optional(),    // Actual success rate when used
});

export type ImpactStats = z.infer<typeof ImpactStats>;

// Core observation schema
export const Observation = z.object({
  // Identity
  id: z.string(),                        // UUID v4
  agent_hash: z.string(),                // SHA-256 hash of agent identifier

  // Location
  domain: z.string(),                    // e.g., "api.example.com"
  path: z.string().optional(),           // e.g., "/v2/users"

  // Content
  category: ObservationCategory,
  summary: z.string(),                   // Human-readable summary
  structured_data: StructuredData.optional(),

  // Impact metrics
  impact_estimate: ImpactEstimate.optional(),             // Observer's estimate
  impact_reports: z.array(ImpactReport).default([]),      // Reports from users
  impact_stats: ImpactStats.optional(),                   // Aggregated statistics

  // Confirmation tracking
  status: ObservationStatus.default('pending'),
  confirmations: z.number().default(1),
  confirming_agents: z.array(z.string()).default([]), // Agent hashes that confirmed
  confidence: z.number().min(0).max(1).default(0),

  // Metadata
  urgency: UrgencyLevel.default('normal'),
  tags: z.array(z.string()).default([]),

  // Timestamps
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  expires_at: z.string().datetime().optional(),
});

export type Observation = z.infer<typeof Observation>;

// Schema for creating new observations (without generated fields)
export const CreateObservation = z.object({
  domain: z.string().min(1),
  path: z.string().optional(),
  category: ObservationCategory,
  summary: z.string().min(1).max(2000),
  structured_data: StructuredData.optional(),
  impact_estimate: ImpactEstimate.optional(),
  urgency: UrgencyLevel.optional(),
  tags: z.array(z.string()).optional(),
  expires_at: z.string().datetime().optional(),
});

export type CreateObservation = z.infer<typeof CreateObservation>;

// Schema for observation stored in JSONL (includes vector ID)
export const StoredObservation = Observation.extend({
  vector_id: z.string().optional(),       // Qdrant point ID
  content_hash: z.string(),               // SHA-256 of canonical content for deduplication
});

export type StoredObservation = z.infer<typeof StoredObservation>;

// Aggregation key for confirmation grouping
export const AggregationKey = z.object({
  domain: z.string(),
  path: z.string().optional(),
  category: ObservationCategory,
  content_hash: z.string(),
});

export type AggregationKey = z.infer<typeof AggregationKey>;
