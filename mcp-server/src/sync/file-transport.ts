import { writeFileSync, readFileSync, readdirSync, unlinkSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import type { StoredObservation } from '../schemas/observation.js';
import { generateSyncBatchId } from '../utils/id-generator.js';

export interface SyncBatch {
  id: string;
  created_at: string;
  observations: StoredObservation[];
}

/**
 * File-based transport for peer sync
 */
export class FileTransport {
  private outboxPath: string;

  constructor(outboxPath: string) {
    this.outboxPath = outboxPath;
    this.ensureDir(outboxPath);
  }

  /**
   * Write observations to outbox for other peers to pick up
   */
  writeToOutbox(observations: StoredObservation[]): string {
    if (observations.length === 0) return '';

    const batch: SyncBatch = {
      id: generateSyncBatchId(),
      created_at: new Date().toISOString(),
      observations,
    };

    const filename = `${batch.id}.json`;
    const filepath = join(this.outboxPath, filename);

    writeFileSync(filepath, JSON.stringify(batch, null, 2), 'utf8');

    return batch.id;
  }

  /**
   * Read sync batches from a peer's outbox
   */
  readFromPeerOutbox(peerOutboxPath: string, afterBatchId?: string): SyncBatch[] {
    if (!existsSync(peerOutboxPath)) {
      return [];
    }

    const files = readdirSync(peerOutboxPath)
      .filter(f => f.endsWith('.json'))
      .sort(); // Sort by filename (which includes timestamp)

    const batches: SyncBatch[] = [];
    let foundAfterBatch = !afterBatchId;

    for (const file of files) {
      const batchId = basename(file, '.json');

      if (!foundAfterBatch) {
        if (batchId === afterBatchId) {
          foundAfterBatch = true;
        }
        continue;
      }

      try {
        const content = readFileSync(join(peerOutboxPath, file), 'utf8');
        const batch = JSON.parse(content) as SyncBatch;
        batches.push(batch);
      } catch (error) {
        console.warn(`Failed to read sync batch ${file}:`, error);
      }
    }

    return batches;
  }

  /**
   * Get the latest batch ID from outbox
   */
  getLatestBatchId(): string | null {
    if (!existsSync(this.outboxPath)) {
      return null;
    }

    const files = readdirSync(this.outboxPath)
      .filter(f => f.endsWith('.json'))
      .sort();

    if (files.length === 0) return null;

    return basename(files[files.length - 1]!, '.json');
  }

  /**
   * Clean up old batches from outbox
   */
  cleanupOldBatches(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): number {
    if (!existsSync(this.outboxPath)) {
      return 0;
    }

    const files = readdirSync(this.outboxPath).filter(f => f.endsWith('.json'));
    const now = Date.now();
    let cleaned = 0;

    for (const file of files) {
      try {
        const filepath = join(this.outboxPath, file);
        const content = readFileSync(filepath, 'utf8');
        const batch = JSON.parse(content) as SyncBatch;
        const createdAt = new Date(batch.created_at).getTime();

        if (now - createdAt > maxAgeMs) {
          unlinkSync(filepath);
          cleaned++;
        }
      } catch (error) {
        console.warn(`Failed to check/clean batch ${file}:`, error);
      }
    }

    return cleaned;
  }

  /**
   * Get outbox path
   */
  getOutboxPath(): string {
    return this.outboxPath;
  }

  private ensureDir(dirPath: string): void {
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
  }
}
