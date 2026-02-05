import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SQLiteStorage } from '../src/storage/sqlite.js';
import { JSONLStorage } from '../src/storage/jsonl.js';
import { Storage } from '../src/storage/index.js';
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

describe('SQLiteStorage', () => {
  let tempDir: string;
  let storage: SQLiteStorage;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-test-'));
    storage = new SQLiteStorage(join(tempDir, 'test.db'));
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  describe('Observation CRUD', () => {
    it('should insert and retrieve observation', () => {
      const obs = createTestObservation();
      storage.insertObservation(obs);

      const retrieved = storage.getObservation(obs.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(obs.id);
      expect(retrieved?.domain).toBe(obs.domain);
      expect(retrieved?.summary).toBe(obs.summary);
    });

    it('should return null for non-existent observation', () => {
      const retrieved = storage.getObservation('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should update observation', () => {
      const obs = createTestObservation();
      storage.insertObservation(obs);

      storage.updateObservation(obs.id, {
        status: 'confirmed',
        confidence: 0.8,
      });

      const retrieved = storage.getObservation(obs.id);
      expect(retrieved?.status).toBe('confirmed');
      expect(retrieved?.confidence).toBe(0.8);
    });

    it('should query observations by domain', () => {
      storage.insertObservation(createTestObservation({ domain: 'a.example.com' }));
      storage.insertObservation(createTestObservation({ domain: 'a.example.com' }));
      storage.insertObservation(createTestObservation({ domain: 'b.example.com' }));

      const results = storage.queryObservations({ domain: 'a.example.com' });
      expect(results.length).toBe(2);
      results.forEach((r) => expect(r.domain).toBe('a.example.com'));
    });

    it('should query observations by category', () => {
      storage.insertObservation(createTestObservation({ category: 'error' }));
      storage.insertObservation(createTestObservation({ category: 'error' }));
      storage.insertObservation(createTestObservation({ category: 'auth' }));

      const results = storage.queryObservations({ category: 'error' });
      expect(results.length).toBe(2);
    });

    it('should respect limit', () => {
      for (let i = 0; i < 10; i++) {
        storage.insertObservation(createTestObservation());
      }

      const results = storage.queryObservations({ limit: 5 });
      expect(results.length).toBe(5);
    });

    it('should count observations', () => {
      for (let i = 0; i < 5; i++) {
        storage.insertObservation(createTestObservation({ domain: 'count.example.com' }));
      }

      const count = storage.countObservations({ domain: 'count.example.com' });
      expect(count).toBe(5);
    });
  });

  describe('Confirmation Groups', () => {
    it('should create confirmation group', () => {
      const group = storage.createConfirmationGroup(
        'example.com',
        '/api',
        'behavior',
        'hash123',
        'obs-123',
        'agent-hash'
      );

      expect(group.domain).toBe('example.com');
      expect(group.path).toBe('/api');
      expect(group.total_confirmations).toBe(1);
      expect(group.unique_agents).toContain('agent-hash');
    });

    it('should find existing confirmation group', () => {
      storage.createConfirmationGroup('example.com', '/api', 'behavior', 'hash123', 'obs-123', 'agent1');

      const found = storage.findConfirmationGroup('example.com', '/api', 'behavior', 'hash123');
      expect(found).not.toBeNull();
      expect(found?.domain).toBe('example.com');
    });

    it('should update confirmation group', () => {
      const group = storage.createConfirmationGroup(
        'example.com',
        '/api',
        'behavior',
        'hash123',
        'obs-123',
        'agent1'
      );

      storage.updateConfirmationGroup(group.id, {
        total_confirmations: 3,
        unique_agents: ['agent1', 'agent2', 'agent3'],
        status: 'confirmed',
        confidence: 0.5,
      });

      const updated = storage.findConfirmationGroup('example.com', '/api', 'behavior', 'hash123');
      expect(updated?.total_confirmations).toBe(3);
      expect(updated?.status).toBe('confirmed');
    });
  });

  describe('Statistics', () => {
    it('should return stats', () => {
      storage.insertObservation(createTestObservation({ category: 'error' }));
      storage.insertObservation(createTestObservation({ category: 'error' }));
      storage.insertObservation(createTestObservation({ category: 'auth' }));

      const stats = storage.getStats();
      expect(stats.total_observations).toBe(3);
      expect(stats.observations_by_category['error']).toBe(2);
      expect(stats.observations_by_category['auth']).toBe(1);
    });

    it('should return domain-specific stats', () => {
      storage.insertObservation(createTestObservation({ domain: 'a.com' }));
      storage.insertObservation(createTestObservation({ domain: 'a.com' }));
      storage.insertObservation(createTestObservation({ domain: 'b.com' }));

      const stats = storage.getStats('a.com');
      expect(stats.total_observations).toBe(2);
    });

    it('should list all domains', () => {
      storage.insertObservation(createTestObservation({ domain: 'a.com' }));
      storage.insertObservation(createTestObservation({ domain: 'b.com' }));
      storage.insertObservation(createTestObservation({ domain: 'a.com' }));

      const domains = storage.getAllDomains();
      expect(domains.length).toBe(2);
      expect(domains.find((d) => d.domain === 'a.com')?.count).toBe(2);
    });
  });

  describe('Failures', () => {
    it('should return failure observations', () => {
      storage.insertObservation(
        createTestObservation({ category: 'error', urgency: 'high' })
      );
      storage.insertObservation(
        createTestObservation({ category: 'error', urgency: 'critical' })
      );
      storage.insertObservation(
        createTestObservation({ category: 'error', urgency: 'normal' })
      );

      const failures = storage.getFailures({});
      expect(failures.length).toBe(2);
    });
  });
});

describe('JSONLStorage', () => {
  let tempDir: string;
  let storage: JSONLStorage;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-jsonl-test-'));
    storage = new JSONLStorage(join(tempDir, 'test.jsonl'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should append and read observations', () => {
    const obs1 = createTestObservation({ id: 'obs-1' });
    const obs2 = createTestObservation({ id: 'obs-2' });

    storage.append(obs1);
    storage.append(obs2);

    const all = storage.readAll();
    expect(all.length).toBe(2);
    expect(all[0]?.id).toBe('obs-1');
    expect(all[1]?.id).toBe('obs-2');
  });

  it('should batch append', () => {
    const observations = [
      createTestObservation({ id: 'batch-1' }),
      createTestObservation({ id: 'batch-2' }),
      createTestObservation({ id: 'batch-3' }),
    ];

    storage.appendBatch(observations);

    const all = storage.readAll();
    expect(all.length).toBe(3);
  });

  it('should read since specific ID', () => {
    storage.append(createTestObservation({ id: 'obs-1' }));
    storage.append(createTestObservation({ id: 'obs-2' }));
    storage.append(createTestObservation({ id: 'obs-3' }));

    const since = storage.readSince('obs-1');
    expect(since.length).toBe(2);
    expect(since[0]?.id).toBe('obs-2');
  });

  it('should get last observation', () => {
    storage.append(createTestObservation({ id: 'obs-1' }));
    storage.append(createTestObservation({ id: 'obs-2' }));

    const last = storage.getLastObservation();
    expect(last?.id).toBe('obs-2');
  });

  it('should count observations', () => {
    storage.append(createTestObservation());
    storage.append(createTestObservation());

    expect(storage.count()).toBe(2);
  });
});

describe('Storage Facade', () => {
  let tempDir: string;
  let storage: Storage;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'substrate-facade-test-'));
    storage = new Storage({
      data_dir: tempDir,
      sqlite_path: join(tempDir, 'test.db'),
      jsonl_path: join(tempDir, 'test.jsonl'),
      log_level: 'error',
    });
  });

  afterEach(() => {
    storage.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  it('should insert to both backends', () => {
    const obs = createTestObservation();
    storage.insert(obs);

    const retrieved = storage.get(obs.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(obs.id);
  });

  it('should query observations', () => {
    storage.insert(createTestObservation({ domain: 'query.example.com' }));
    storage.insert(createTestObservation({ domain: 'query.example.com' }));

    const results = storage.query({ domain: 'query.example.com' });
    expect(results.length).toBe(2);
  });
});
