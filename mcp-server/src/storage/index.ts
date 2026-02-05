import { SQLiteStorage } from './sqlite.js';
import { JSONLStorage } from './jsonl.js';
import type { StoredObservation, ObservationCategory, ObservationStatus } from '../schemas/observation.js';
import type { SubstrateConfig } from '../schemas/config.js';
import { initializeDataDir } from '../utils/paths.js';

export interface StorageQueryOptions {
  domain?: string;
  path?: string;
  category?: ObservationCategory;
  status?: ObservationStatus;
  since?: string;
  limit?: number;
  offset?: number;
}

/**
 * Storage facade that coordinates SQLite (for queries) and JSONL (for durability)
 */
export class Storage {
  private sqlite: SQLiteStorage;
  private jsonl: JSONLStorage;

  constructor(config: SubstrateConfig) {
    const paths = initializeDataDir(config.data_dir);
    const sqlitePath = config.sqlite_path ?? paths.sqlite;
    const jsonlPath = config.jsonl_path ?? paths.jsonl;

    this.sqlite = new SQLiteStorage(sqlitePath);
    this.jsonl = new JSONLStorage(jsonlPath);
  }

  /**
   * Insert an observation into both storage backends
   */
  insert(observation: StoredObservation): void {
    // Write to both storage backends
    this.sqlite.insertObservation(observation);
    this.jsonl.append(observation);
  }

  /**
   * Get an observation by ID
   */
  get(id: string): StoredObservation | null {
    return this.sqlite.getObservation(id);
  }

  /**
   * Update an observation
   */
  update(id: string, updates: Partial<StoredObservation>): void {
    this.sqlite.updateObservation(id, updates);
    // Note: JSONL is append-only, updates are not reflected there
    // The JSONL serves as a write-ahead log, SQLite is the source of truth for current state
  }

  /**
   * Query observations with filters
   */
  query(options: StorageQueryOptions): StoredObservation[] {
    return this.sqlite.queryObservations(options);
  }

  /**
   * Count observations matching filters
   */
  count(options: StorageQueryOptions): number {
    return this.sqlite.countObservations(options);
  }

  /**
   * Get observation statistics
   */
  getStats(domain?: string) {
    return this.sqlite.getStats(domain);
  }

  /**
   * Get all domains with observation counts
   */
  getAllDomains() {
    return this.sqlite.getAllDomains();
  }

  /**
   * Get failure observations
   */
  getFailures(options: { domain?: string; since?: string; limit?: number }) {
    return this.sqlite.getFailures(options);
  }

  /**
   * Find an existing confirmation group
   */
  findConfirmationGroup(domain: string, path: string | undefined, category: string, contentHash: string) {
    return this.sqlite.findConfirmationGroup(domain, path, category, contentHash);
  }

  /**
   * Create a new confirmation group
   */
  createConfirmationGroup(
    domain: string,
    path: string | undefined,
    category: string,
    contentHash: string,
    observationId: string,
    agentHash: string
  ) {
    return this.sqlite.createConfirmationGroup(domain, path, category, contentHash, observationId, agentHash);
  }

  /**
   * Update a confirmation group
   */
  updateConfirmationGroup(
    id: number,
    updates: { total_confirmations?: number; unique_agents?: string[]; status?: ObservationStatus; confidence?: number }
  ) {
    return this.sqlite.updateConfirmationGroup(id, updates);
  }

  /**
   * Get sync state for a peer
   */
  getSyncState(peerName: string) {
    return this.sqlite.getSyncState(peerName);
  }

  /**
   * Update sync state for a peer
   */
  updateSyncState(peerName: string, lastSyncAt: string, lastObservationId: string) {
    return this.sqlite.updateSyncState(peerName, lastSyncAt, lastObservationId);
  }

  /**
   * Read observations from JSONL since a specific ID (for sync)
   */
  readJSONLSince(sinceId: string | null): StoredObservation[] {
    return this.jsonl.readSince(sinceId);
  }

  /**
   * Close storage connections
   */
  close(): void {
    this.sqlite.close();
  }
}

export { SQLiteStorage } from './sqlite.js';
export { JSONLStorage } from './jsonl.js';
