import type { StoredObservation } from '../schemas/observation.js';
import type { FileTransport } from './file-transport.js';

/**
 * Fast-path for urgent signals (failures, critical issues)
 */
export class UrgentSignalHandler {
  private transport: FileTransport;
  private pendingUrgent: StoredObservation[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private urgentIntervalMs: number;

  constructor(transport: FileTransport, urgentIntervalMs: number = 5000) {
    this.transport = transport;
    this.urgentIntervalMs = urgentIntervalMs;
  }

  /**
   * Check if an observation is urgent
   */
  isUrgent(observation: StoredObservation): boolean {
    // Critical urgency
    if (observation.urgency === 'critical') return true;

    // High urgency errors
    if (observation.urgency === 'high' && observation.category === 'error') return true;

    // Auth failures are always urgent
    if (observation.category === 'auth' && observation.structured_data) {
      const data = observation.structured_data as Record<string, unknown>;
      if (data['error'] || data['failed']) return true;
    }

    return false;
  }

  /**
   * Queue an urgent observation for fast sync
   */
  queue(observation: StoredObservation): void {
    this.pendingUrgent.push(observation);

    // Start flush timer if not already running
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.urgentIntervalMs);
    }
  }

  /**
   * Flush urgent observations immediately
   */
  flush(): string | null {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.pendingUrgent.length === 0) {
      return null;
    }

    const observations = this.pendingUrgent;
    this.pendingUrgent = [];

    return this.transport.writeToOutbox(observations);
  }

  /**
   * Get count of pending urgent observations
   */
  getPendingCount(): number {
    return this.pendingUrgent.length;
  }

  /**
   * Stop the urgent handler
   */
  stop(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.pendingUrgent = [];
  }
}
