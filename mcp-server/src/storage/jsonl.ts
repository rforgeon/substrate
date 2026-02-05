import { appendFileSync, readFileSync, existsSync } from 'node:fs';
import type { StoredObservation } from '../schemas/observation.js';

/**
 * Append-only JSONL log for observations
 * Provides durability and easy export/sync
 */
export class JSONLStorage {
  private filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /**
   * Append an observation to the log
   */
  append(observation: StoredObservation): void {
    const line = JSON.stringify(observation) + '\n';
    appendFileSync(this.filePath, line, 'utf8');
  }

  /**
   * Append multiple observations in a batch
   */
  appendBatch(observations: StoredObservation[]): void {
    const lines = observations.map(o => JSON.stringify(o)).join('\n') + '\n';
    appendFileSync(this.filePath, lines, 'utf8');
  }

  /**
   * Read all observations from the log
   */
  readAll(): StoredObservation[] {
    if (!existsSync(this.filePath)) {
      return [];
    }

    const content = readFileSync(this.filePath, 'utf8');
    const lines = content.trim().split('\n').filter(line => line.length > 0);

    return lines.map(line => JSON.parse(line) as StoredObservation);
  }

  /**
   * Read observations since a specific ID
   * Used for incremental sync
   */
  readSince(sinceId: string | null): StoredObservation[] {
    const all = this.readAll();

    if (!sinceId) {
      return all;
    }

    const sinceIndex = all.findIndex(o => o.id === sinceId);
    if (sinceIndex === -1) {
      return all;
    }

    return all.slice(sinceIndex + 1);
  }

  /**
   * Get the last observation in the log
   */
  getLastObservation(): StoredObservation | null {
    const all = this.readAll();
    return all.length > 0 ? all[all.length - 1]! : null;
  }

  /**
   * Count observations in the log
   */
  count(): number {
    if (!existsSync(this.filePath)) {
      return 0;
    }

    const content = readFileSync(this.filePath, 'utf8');
    return content.trim().split('\n').filter(line => line.length > 0).length;
  }

  /**
   * Get the file path
   */
  getPath(): string {
    return this.filePath;
  }
}
