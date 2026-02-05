import type Database from 'better-sqlite3';

export const version = 1;

export function up(db: Database.Database): void {
  // Main observations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      agent_hash TEXT NOT NULL,
      domain TEXT NOT NULL,
      path TEXT,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      structured_data TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      confirmations INTEGER NOT NULL DEFAULT 1,
      confirming_agents TEXT NOT NULL DEFAULT '[]',
      confidence REAL NOT NULL DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT 'normal',
      tags TEXT NOT NULL DEFAULT '[]',
      content_hash TEXT NOT NULL,
      vector_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT
    );

    -- Indices for common queries
    CREATE INDEX IF NOT EXISTS idx_observations_domain ON observations(domain);
    CREATE INDEX IF NOT EXISTS idx_observations_domain_path ON observations(domain, path);
    CREATE INDEX IF NOT EXISTS idx_observations_category ON observations(category);
    CREATE INDEX IF NOT EXISTS idx_observations_status ON observations(status);
    CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash);
    CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at);
    CREATE INDEX IF NOT EXISTS idx_observations_urgency ON observations(urgency);

    -- Composite index for confirmation grouping
    CREATE INDEX IF NOT EXISTS idx_observations_aggregation
      ON observations(domain, path, category, content_hash);
  `);

  // Confirmation tracking table (for efficient aggregation)
  db.exec(`
    CREATE TABLE IF NOT EXISTS confirmation_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      path TEXT,
      category TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      canonical_observation_id TEXT NOT NULL,
      total_confirmations INTEGER NOT NULL DEFAULT 1,
      unique_agents TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      confidence REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(domain, path, category, content_hash)
    );

    CREATE INDEX IF NOT EXISTS idx_confirmation_groups_lookup
      ON confirmation_groups(domain, path, category, content_hash);
  `);

  // Sync state tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_state (
      peer_name TEXT PRIMARY KEY,
      last_sync_at TEXT,
      last_observation_id TEXT,
      sync_count INTEGER NOT NULL DEFAULT 0
    );
  `);

  // Metadata table for schema versioning
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '1');
  `);
}

export function down(db: Database.Database): void {
  db.exec(`
    DROP TABLE IF EXISTS observations;
    DROP TABLE IF EXISTS confirmation_groups;
    DROP TABLE IF EXISTS sync_state;
    DROP TABLE IF EXISTS metadata;
  `);
}
