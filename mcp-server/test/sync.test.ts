import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FileTransport } from '../src/sync/file-transport.js';
import { UrgentSignalHandler } from '../src/sync/urgent.js';
import type { StoredObservation } from '../src/schemas/observation.js';

function createTestObservation(overrides: Partial<StoredObservation> = {}): StoredObservation {
  const now = new Date().toISOString();
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    agent_hash: 'test-agent-hash',
    domain: 'test.example.com',
    path: '/api/test',
    category: 'behavior',
    summary: 'Test observation',
    status: 'pending',
    confirmations: 1,
    confirming_agents: ['test-agent-hash'],
    confidence: 0,
    urgency: 'normal',
    tags: [],
    content_hash: 'test-content-hash',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

describe('FileTransport', () => {
  let tempDir: string;
  let transport: FileTransport;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-transport-test-'));
    transport = new FileTransport(join(tempDir, 'outbox'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should write batch to outbox', () => {
    const obs = createTestObservation();
    const batchId = transport.writeToOutbox([obs]);

    expect(batchId).toBeTruthy();
    expect(batchId).toMatch(/^sync_/);
  });

  it('should read batches from peer outbox', () => {
    // Create some batches
    transport.writeToOutbox([createTestObservation({ id: 'obs-1' })]);
    transport.writeToOutbox([createTestObservation({ id: 'obs-2' })]);

    // Read from our own outbox as if we were a peer
    const batches = transport.readFromPeerOutbox(transport.getOutboxPath());

    expect(batches.length).toBe(2);
    expect(batches[0]?.observations[0]?.id).toBe('obs-1');
    expect(batches[1]?.observations[0]?.id).toBe('obs-2');
  });

  it('should read batches after specific ID', async () => {
    transport.writeToOutbox([createTestObservation({ id: 'obs-1' })]);
    await new Promise(r => setTimeout(r, 5)); // Small delay to ensure different timestamps
    const secondBatchId = transport.writeToOutbox([createTestObservation({ id: 'obs-2' })]);
    await new Promise(r => setTimeout(r, 5));
    transport.writeToOutbox([createTestObservation({ id: 'obs-3' })]);

    const batches = transport.readFromPeerOutbox(transport.getOutboxPath(), secondBatchId);

    expect(batches.length).toBe(1);
    expect(batches[0]?.observations[0]?.id).toBe('obs-3');
  });

  it('should get latest batch ID', async () => {
    expect(transport.getLatestBatchId()).toBeNull();

    transport.writeToOutbox([createTestObservation()]);
    const id1 = transport.getLatestBatchId();
    expect(id1).toBeTruthy();

    await new Promise(r => setTimeout(r, 5)); // Small delay to ensure different timestamps
    transport.writeToOutbox([createTestObservation()]);
    const id2 = transport.getLatestBatchId();
    expect(id2).not.toBe(id1);
  });

  it('should cleanup old batches', async () => {
    transport.writeToOutbox([createTestObservation()]);

    // Wait a tiny bit then cleanup with very short max age
    await new Promise(r => setTimeout(r, 10));
    const cleaned = transport.cleanupOldBatches(5); // 5ms max age

    expect(cleaned).toBe(1);
    expect(transport.getLatestBatchId()).toBeNull();
  });

  it('should return empty for non-existent peer outbox', () => {
    const batches = transport.readFromPeerOutbox('/non/existent/path');
    expect(batches).toEqual([]);
  });

  it('should not write empty observations', () => {
    const batchId = transport.writeToOutbox([]);
    expect(batchId).toBe('');
  });
});

describe('UrgentSignalHandler', () => {
  let tempDir: string;
  let transport: FileTransport;
  let handler: UrgentSignalHandler;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-urgent-test-'));
    transport = new FileTransport(join(tempDir, 'outbox'));
    handler = new UrgentSignalHandler(transport, 100);
  });

  afterEach(() => {
    handler.stop();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should identify critical observations as urgent', () => {
    const obs = createTestObservation({ urgency: 'critical' });
    expect(handler.isUrgent(obs)).toBe(true);
  });

  it('should identify high urgency errors as urgent', () => {
    const obs = createTestObservation({ urgency: 'high', category: 'error' });
    expect(handler.isUrgent(obs)).toBe(true);
  });

  it('should not identify normal observations as urgent', () => {
    const obs = createTestObservation({ urgency: 'normal' });
    expect(handler.isUrgent(obs)).toBe(false);
  });

  it('should queue urgent observations', () => {
    const obs = createTestObservation({ urgency: 'critical' });
    handler.queue(obs);
    expect(handler.getPendingCount()).toBe(1);
  });

  it('should flush urgent observations immediately', () => {
    const obs = createTestObservation({ urgency: 'critical' });
    handler.queue(obs);

    const batchId = handler.flush();

    expect(batchId).toBeTruthy();
    expect(handler.getPendingCount()).toBe(0);
  });

  it('should return null when flushing empty queue', () => {
    const batchId = handler.flush();
    expect(batchId).toBeNull();
  });
});
