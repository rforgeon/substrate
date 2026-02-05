import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Storage } from '../src/storage/index.js';
import { ConfirmationEngine, Aggregator, Promoter, ContradictionDetector } from '../src/confirmation/index.js';
import type { StoredObservation } from '../src/schemas/observation.js';
import type { ConfirmationConfig } from '../src/schemas/config.js';

function createTestObservation(overrides: Partial<StoredObservation> = {}): StoredObservation {
  const now = new Date().toISOString();
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    agent_hash: `agent-${Math.random().toString(36).slice(2)}`,
    domain: 'test.example.com',
    path: '/api/test',
    category: 'behavior',
    summary: 'Test observation',
    structured_data: { key: 'value' },
    status: 'pending',
    confirmations: 1,
    confirming_agents: [],
    confidence: 0,
    urgency: 'normal',
    tags: [],
    content_hash: 'test-content-hash',
    created_at: now,
    updated_at: now,
    ...overrides,
  };
}

const defaultConfig: ConfirmationConfig = {
  threshold: 3,
  confidence_factor: 6,
  contradiction_window_hours: 24,
  stale_after_days: 30,
};

describe('Aggregator', () => {
  let tempDir: string;
  let storage: Storage;
  let aggregator: Aggregator;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-aggregator-test-'));
    storage = new Storage({
      data_dir: tempDir,
      log_level: 'error',
    });
    aggregator = new Aggregator(storage, defaultConfig);
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should create new group for first observation', () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const result = aggregator.aggregate(obs);

    expect(result.isNew).toBe(true);
    expect(result.totalConfirmations).toBe(1);
    expect(result.uniqueAgentCount).toBe(1);
  });

  it('should increment confirmations from different agents', () => {
    const obs1 = createTestObservation({ agent_hash: 'agent1' });
    const obs2 = createTestObservation({
      agent_hash: 'agent2',
      domain: obs1.domain,
      path: obs1.path,
      category: obs1.category,
      structured_data: obs1.structured_data,
    });

    storage.insert(obs1);
    aggregator.aggregate(obs1);

    storage.insert(obs2);
    const result = aggregator.aggregate(obs2);

    expect(result.isNew).toBe(false);
    expect(result.totalConfirmations).toBe(2);
    expect(result.uniqueAgentCount).toBe(2);
  });

  it('should not increment for same agent', () => {
    const obs1 = createTestObservation({ agent_hash: 'same-agent' });
    const obs2 = createTestObservation({
      agent_hash: 'same-agent',
      domain: obs1.domain,
      path: obs1.path,
      category: obs1.category,
      structured_data: obs1.structured_data,
    });

    storage.insert(obs1);
    aggregator.aggregate(obs1);

    storage.insert(obs2);
    const result = aggregator.aggregate(obs2);

    expect(result.totalConfirmations).toBe(1);
    expect(result.uniqueAgentCount).toBe(1);
  });
});

describe('Promoter', () => {
  let tempDir: string;
  let storage: Storage;
  let promoter: Promoter;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-promoter-test-'));
    storage = new Storage({
      data_dir: tempDir,
      log_level: 'error',
    });
    promoter = new Promoter(storage, defaultConfig);
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should calculate confidence correctly', () => {
    expect(promoter.calculateConfidence(0)).toBe(0);
    expect(promoter.calculateConfidence(3)).toBe(0.5);
    expect(promoter.calculateConfidence(6)).toBe(1);
    expect(promoter.calculateConfidence(10)).toBe(1); // Capped at 1
  });

  it('should promote when threshold met', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    // Create confirmation group
    const group = storage.createConfirmationGroup(
      obs.domain,
      obs.path,
      obs.category,
      obs.content_hash,
      obs.id,
      obs.agent_hash
    );

    // Simulate 3 confirmations
    storage.updateConfirmationGroup(group.id, {
      total_confirmations: 3,
      unique_agents: ['agent1', 'agent2', 'agent3'],
    });

    const result = await promoter.checkAndPromote(group.id, 3, obs.id);

    expect(result.promoted).toBe(true);
    expect(result.newStatus).toBe('confirmed');
    expect(result.newConfidence).toBe(0.5);
  });

  it('should not promote below threshold', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const group = storage.createConfirmationGroup(
      obs.domain,
      obs.path,
      obs.category,
      obs.content_hash,
      obs.id,
      obs.agent_hash
    );

    const result = await promoter.checkAndPromote(group.id, 2, obs.id);

    expect(result.promoted).toBe(false);
    expect(result.newStatus).toBe('pending');
  });

  it('should manually confirm', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const result = await promoter.manualConfirm(obs.id, 'Admin verified');

    expect(result.promoted).toBe(true);
    expect(result.newStatus).toBe('confirmed');
    expect(result.newConfidence).toBe(1);
  });

  it('should mark as stale', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const result = await promoter.markStale(obs.id, 'Outdated');

    expect(result.newStatus).toBe('stale');
  });

  it('should reject observation', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const result = await promoter.reject(obs.id, 'Incorrect');

    expect(result.newStatus).toBe('contradicted');
    expect(result.newConfidence).toBe(0);
  });
});

describe('ContradictionDetector', () => {
  let tempDir: string;
  let storage: Storage;
  let detector: ContradictionDetector;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-contradiction-test-'));
    storage = new Storage({
      data_dir: tempDir,
      log_level: 'error',
    });
    detector = new ContradictionDetector(storage, defaultConfig);
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should detect no contradiction for same data', () => {
    const obs1 = createTestObservation({ structured_data: { format: 'DD/MM/YYYY' } });
    const obs2 = createTestObservation({
      domain: obs1.domain,
      path: obs1.path,
      category: obs1.category,
      structured_data: { format: 'DD/MM/YYYY' },
    });

    storage.insert(obs1);
    storage.insert(obs2);

    const result = detector.detectContradictions(obs2);
    expect(result.hasContradiction).toBe(false);
  });

  it('should detect contradiction for conflicting data', () => {
    const obs1 = createTestObservation({ structured_data: { format: 'DD/MM/YYYY' } });
    const obs2 = createTestObservation({
      domain: obs1.domain,
      path: obs1.path,
      category: obs1.category,
      structured_data: { format: 'MM/DD/YYYY' },
    });

    storage.insert(obs1);
    storage.insert(obs2);

    const result = detector.detectContradictions(obs2);
    expect(result.hasContradiction).toBe(true);
    expect(result.contradictingObservations).toContain(obs1.id);
  });

  it('should mark observations as contradicted', () => {
    const obs1 = createTestObservation();
    storage.insert(obs1);

    detector.markAsContradicted([obs1.id]);

    const updated = storage.get(obs1.id);
    expect(updated?.status).toBe('contradicted');
  });
});

describe('ConfirmationEngine', () => {
  let tempDir: string;
  let storage: Storage;
  let engine: ConfirmationEngine;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-engine-test-'));
    storage = new Storage({
      data_dir: tempDir,
      log_level: 'error',
    });
    engine = new ConfirmationEngine(storage, defaultConfig);
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should process new observation', async () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const result = await engine.processObservation(obs);

    expect(result.aggregation.isNew).toBe(true);
    expect(result.promotion.newStatus).toBe('pending');
    expect(result.contradiction.hasContradiction).toBe(false);
  });

  it('should promote after multiple confirmations', async () => {
    const baseObs = createTestObservation();
    storage.insert(baseObs);
    await engine.processObservation(baseObs);

    // Add confirmations from different agents
    for (let i = 0; i < 2; i++) {
      const obs = createTestObservation({
        agent_hash: `agent-${i}`,
        domain: baseObs.domain,
        path: baseObs.path,
        category: baseObs.category,
        structured_data: baseObs.structured_data,
      });
      storage.insert(obs);
      await engine.processObservation(obs);
    }

    // Get updated observation
    const updated = storage.get(baseObs.id);
    expect(updated?.status).toBe('confirmed');
    expect(updated?.confirmations).toBe(3);
  });

  it('should get threshold', () => {
    expect(engine.getThreshold()).toBe(3);
  });

  it('should calculate confidence', () => {
    expect(engine.calculateConfidence(3)).toBe(0.5);
  });
});
