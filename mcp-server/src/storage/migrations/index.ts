import type Database from 'better-sqlite3';
import * as migration001 from './001_initial.js';

interface Migration {
  version: number;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

const migrations: Migration[] = [
  migration001,
];

export function getCurrentVersion(db: Database.Database): number {
  try {
    const row = db.prepare('SELECT value FROM metadata WHERE key = ?').get('schema_version') as { value: string } | undefined;
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}

export function runMigrations(db: Database.Database): void {
  const currentVersion = getCurrentVersion(db);

  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run('schema_version', migration.version.toString());
      })();
    }
  }
}

export { migrations };
