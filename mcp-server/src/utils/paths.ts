import { homedir } from 'node:os';
import { join } from 'node:path';
import { mkdirSync, existsSync } from 'node:fs';

/**
 * Get the default data directory for Substrate
 */
export function getDefaultDataDir(): string {
  const baseDir = process.env['SUBSTRATE_DATA_DIR'] ??
    process.env['XDG_DATA_HOME'] ??
    join(homedir(), '.local', 'share');

  return join(baseDir, 'substrate');
}

/**
 * Ensure a directory exists, creating it if necessary
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get all paths for the Substrate data directory
 */
export function getDataPaths(dataDir: string) {
  return {
    root: dataDir,
    sqlite: join(dataDir, 'substrate.db'),
    jsonl: join(dataDir, 'observations.jsonl'),
    outbox: join(dataDir, 'outbox'),
    config: join(dataDir, 'config.json'),
    logs: join(dataDir, 'logs'),
  };
}

/**
 * Initialize the data directory structure
 */
export function initializeDataDir(dataDir: string): ReturnType<typeof getDataPaths> {
  const paths = getDataPaths(dataDir);

  ensureDir(paths.root);
  ensureDir(paths.outbox);
  ensureDir(paths.logs);

  return paths;
}
