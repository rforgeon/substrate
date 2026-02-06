import type Database from 'better-sqlite3';

export const version = 2;

export function up(db: Database.Database): void {
  // Add impact tracking columns to observations table
  db.exec(`
    ALTER TABLE observations ADD COLUMN impact_estimate TEXT;
    ALTER TABLE observations ADD COLUMN impact_reports TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE observations ADD COLUMN impact_stats TEXT;
  `);

  // Create index for finding high-impact observations
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_observations_impact
      ON observations(json_extract(impact_stats, '$.total_uses'));
  `);

  // Update schema version
  db.exec(`
    UPDATE metadata SET value = '2' WHERE key = 'schema_version';
  `);
}

export function down(db: Database.Database): void {
  // SQLite doesn't support DROP COLUMN easily, so we'd need to recreate the table
  // For simplicity, we'll just leave the columns in place on downgrade
  db.exec(`
    UPDATE metadata SET value = '1' WHERE key = 'schema_version';
  `);
}
