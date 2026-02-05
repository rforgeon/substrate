import { FileTransport, type SyncBatch } from './file-transport.js';
import { UrgentSignalHandler } from './urgent.js';
import type { Storage } from '../storage/index.js';
import type { StoredObservation } from '../schemas/observation.js';
import type { SyncConfig, PeerConfig } from '../schemas/config.js';
import type { ConfirmationEngine } from '../confirmation/index.js';
import type { VectorSearch } from '../vector/index.js';

export interface SyncResult {
  peer: string;
  batchesProcessed: number;
  observationsImported: number;
  lastBatchId: string | null;
}

/**
 * Sync coordinator for peer-to-peer observation sharing
 */
export class SyncCoordinator {
  private storage: Storage;
  private transport: FileTransport;
  private urgentHandler: UrgentSignalHandler;
  private confirmationEngine: ConfirmationEngine | null;
  private vectorSearch: VectorSearch | null;
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private running: boolean = false;

  constructor(
    storage: Storage,
    config: SyncConfig,
    confirmationEngine?: ConfirmationEngine,
    vectorSearch?: VectorSearch
  ) {
    this.storage = storage;
    this.config = config;
    this.transport = new FileTransport(config.outbox_path);
    this.urgentHandler = new UrgentSignalHandler(this.transport, config.urgent_interval_ms);
    this.confirmationEngine = confirmationEngine ?? null;
    this.vectorSearch = vectorSearch ?? null;
  }

  /**
   * Start the sync coordinator
   */
  start(): void {
    if (this.running || !this.config.enabled) return;

    this.running = true;
    this.scheduleSyncCycle();
  }

  /**
   * Stop the sync coordinator
   */
  stop(): void {
    this.running = false;

    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }

    this.urgentHandler.stop();
  }

  /**
   * Export an observation for sync
   */
  exportObservation(observation: StoredObservation): void {
    if (!this.config.enabled) return;

    // Check if urgent
    if (this.urgentHandler.isUrgent(observation)) {
      this.urgentHandler.queue(observation);
    }

    // Regular observations are batched in the periodic sync
  }

  /**
   * Flush urgent observations immediately
   */
  flushUrgent(): string | null {
    return this.urgentHandler.flush();
  }

  /**
   * Run a sync cycle with all peers
   */
  async syncWithPeers(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];

    for (const peer of this.config.peers) {
      if (!peer.enabled) continue;

      try {
        const result = await this.syncWithPeer(peer);
        results.push(result);
      } catch (error) {
        console.warn(`Sync with peer ${peer.name} failed:`, error);
        results.push({
          peer: peer.name,
          batchesProcessed: 0,
          observationsImported: 0,
          lastBatchId: null,
        });
      }
    }

    return results;
  }

  /**
   * Sync with a specific peer
   */
  async syncWithPeer(peer: PeerConfig): Promise<SyncResult> {
    // Get last sync state
    const syncState = this.storage.getSyncState(peer.name);
    const lastBatchId = syncState?.last_observation_id ?? null;

    // Read new batches from peer
    const batches = this.transport.readFromPeerOutbox(peer.path, lastBatchId ?? undefined);

    let observationsImported = 0;
    let lastProcessedBatchId: string | null = null;

    for (const batch of batches) {
      const imported = await this.importBatch(batch);
      observationsImported += imported;
      lastProcessedBatchId = batch.id;
    }

    // Update sync state
    if (lastProcessedBatchId) {
      this.storage.updateSyncState(peer.name, new Date().toISOString(), lastProcessedBatchId);
    }

    return {
      peer: peer.name,
      batchesProcessed: batches.length,
      observationsImported,
      lastBatchId: lastProcessedBatchId,
    };
  }

  /**
   * Import a sync batch
   */
  private async importBatch(batch: SyncBatch): Promise<number> {
    let imported = 0;

    for (const observation of batch.observations) {
      try {
        // Check if observation already exists
        const existing = this.storage.get(observation.id);
        if (existing) continue;

        // Insert observation
        this.storage.insert(observation);

        // Index in vector search
        if (this.vectorSearch) {
          const vectorId = await this.vectorSearch.index(observation);
          if (vectorId) {
            this.storage.update(observation.id, { vector_id: vectorId });
          }
        }

        // Process through confirmation engine
        if (this.confirmationEngine) {
          await this.confirmationEngine.processObservation(observation);
        }

        imported++;
      } catch (error) {
        console.warn(`Failed to import observation ${observation.id}:`, error);
      }
    }

    return imported;
  }

  /**
   * Export pending observations to outbox
   */
  exportPendingObservations(): string | null {
    // Get observations since last export
    const lastBatchId = this.transport.getLatestBatchId();
    const observations = this.storage.readJSONLSince(lastBatchId);

    if (observations.length === 0) return null;

    return this.transport.writeToOutbox(observations);
  }

  /**
   * Schedule the next sync cycle
   */
  private scheduleSyncCycle(): void {
    if (!this.running) return;

    this.syncTimer = setTimeout(async () => {
      try {
        // Export our observations
        this.exportPendingObservations();

        // Import from peers
        await this.syncWithPeers();

        // Cleanup old batches
        this.transport.cleanupOldBatches();
      } catch (error) {
        console.warn('Sync cycle failed:', error);
      }

      // Schedule next cycle
      this.scheduleSyncCycle();
    }, this.config.interval_ms);
  }

  /**
   * Get the outbox path
   */
  getOutboxPath(): string {
    return this.transport.getOutboxPath();
  }

  /**
   * Check if sync is running
   */
  isRunning(): boolean {
    return this.running;
  }

  /**
   * Get peer configurations
   */
  getPeers(): PeerConfig[] {
    return this.config.peers;
  }
}

export { FileTransport } from './file-transport.js';
export { UrgentSignalHandler } from './urgent.js';
export type { SyncBatch } from './file-transport.js';
