import { z } from 'zod';

// Peer configuration for sync
export const PeerConfig = z.object({
  name: z.string(),
  path: z.string(),                      // Path to peer's outbox directory
  enabled: z.boolean().default(true),
});

export type PeerConfig = z.infer<typeof PeerConfig>;

// Qdrant configuration
export const QdrantConfig = z.object({
  url: z.string().url().default('http://localhost:6333'),
  collection_name: z.string().default('substrate_observations'),
  api_key: z.string().optional(),
});

export type QdrantConfig = z.infer<typeof QdrantConfig>;

// Confirmation engine configuration
export const ConfirmationConfig = z.object({
  threshold: z.number().min(1).default(3),           // N confirmations needed
  confidence_factor: z.number().min(1).default(6),   // Divisor for confidence calculation
  contradiction_window_hours: z.number().default(24), // Window for contradiction detection
  stale_after_days: z.number().default(30),          // Mark as stale after N days
});

export type ConfirmationConfig = z.infer<typeof ConfirmationConfig>;

// Sync configuration
export const SyncConfig = z.object({
  enabled: z.boolean().default(true),
  interval_ms: z.number().default(60000),           // 1 minute default
  urgent_interval_ms: z.number().default(5000),     // 5 seconds for urgent
  outbox_path: z.string(),
  peers: z.array(PeerConfig).default([]),
});

export type SyncConfig = z.infer<typeof SyncConfig>;

// Embedding model configuration
export const EmbeddingConfig = z.object({
  model: z.string().default('Xenova/all-MiniLM-L6-v2'),
  dimension: z.number().default(384),
  batch_size: z.number().default(32),
});

export type EmbeddingConfig = z.infer<typeof EmbeddingConfig>;

// Main configuration schema
export const SubstrateConfig = z.object({
  // Data paths
  data_dir: z.string(),
  sqlite_path: z.string().optional(),
  jsonl_path: z.string().optional(),

  // Agent identity
  agent_id: z.string().optional(),       // Will be hashed for privacy

  // Feature configurations
  qdrant: QdrantConfig.optional(),
  confirmation: ConfirmationConfig.optional(),
  sync: SyncConfig.optional(),
  embedding: EmbeddingConfig.optional(),

  // Logging
  log_level: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

export type SubstrateConfig = z.infer<typeof SubstrateConfig>;

// Default configuration factory
export function createDefaultConfig(dataDir: string): SubstrateConfig {
  return {
    data_dir: dataDir,
    sqlite_path: `${dataDir}/substrate.db`,
    jsonl_path: `${dataDir}/observations.jsonl`,
    qdrant: {
      url: 'http://localhost:6333',
      collection_name: 'substrate_observations',
    },
    confirmation: {
      threshold: 3,
      confidence_factor: 6,
      contradiction_window_hours: 24,
      stale_after_days: 30,
    },
    sync: {
      enabled: true,
      interval_ms: 60000,
      urgent_interval_ms: 5000,
      outbox_path: `${dataDir}/outbox`,
      peers: [],
    },
    embedding: {
      model: 'Xenova/all-MiniLM-L6-v2',
      dimension: 384,
      batch_size: 32,
    },
    log_level: 'info',
  };
}

// Environment variable overrides
export function configFromEnv(baseConfig: SubstrateConfig): SubstrateConfig {
  const env = process.env;

  return {
    ...baseConfig,
    data_dir: env['SUBSTRATE_DATA_DIR'] ?? baseConfig.data_dir,
    agent_id: env['SUBSTRATE_AGENT_ID'] ?? baseConfig.agent_id,
    log_level: (env['SUBSTRATE_LOG_LEVEL'] as SubstrateConfig['log_level']) ?? baseConfig.log_level,
    qdrant: {
      ...baseConfig.qdrant,
      url: env['SUBSTRATE_QDRANT_URL'] ?? baseConfig.qdrant?.url ?? 'http://localhost:6333',
      collection_name: env['SUBSTRATE_QDRANT_COLLECTION'] ?? baseConfig.qdrant?.collection_name ?? 'substrate_observations',
      api_key: env['SUBSTRATE_QDRANT_API_KEY'] ?? baseConfig.qdrant?.api_key,
    },
  };
}
