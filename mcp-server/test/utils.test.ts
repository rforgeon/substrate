import { describe, it, expect } from 'vitest';
import { sha256, hashAgentId, generateContentHash, generateSummaryHash } from '../src/utils/hash.js';
import { generateObservationId, generateVectorId, generateSyncBatchId } from '../src/utils/id-generator.js';
import { getDefaultDataDir, getDataPaths } from '../src/utils/paths.js';

describe('Hash Utilities', () => {
  describe('sha256', () => {
    it('should generate consistent hashes', () => {
      const hash1 = sha256('test');
      const hash2 = sha256('test');
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different inputs', () => {
      const hash1 = sha256('test1');
      const hash2 = sha256('test2');
      expect(hash1).not.toBe(hash2);
    });

    it('should return 64 character hex string', () => {
      const hash = sha256('test');
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe('hashAgentId', () => {
    it('should add prefix before hashing', () => {
      const directHash = sha256('agent123');
      const agentHash = hashAgentId('agent123');
      expect(agentHash).not.toBe(directHash);
    });

    it('should generate consistent hashes', () => {
      const hash1 = hashAgentId('agent123');
      const hash2 = hashAgentId('agent123');
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateContentHash', () => {
    it('should generate consistent hashes for same content', () => {
      const hash1 = generateContentHash('example.com', '/api', 'error', { code: 500 });
      const hash2 = generateContentHash('example.com', '/api', 'error', { code: 500 });
      expect(hash1).toBe(hash2);
    });

    it('should normalize domain case', () => {
      const hash1 = generateContentHash('EXAMPLE.COM', '/api', 'error', null);
      const hash2 = generateContentHash('example.com', '/api', 'error', null);
      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different content', () => {
      const hash1 = generateContentHash('example.com', '/api', 'error', { code: 500 });
      const hash2 = generateContentHash('example.com', '/api', 'error', { code: 404 });
      expect(hash1).not.toBe(hash2);
    });

    it('should handle undefined path', () => {
      const hash1 = generateContentHash('example.com', undefined, 'behavior', null);
      const hash2 = generateContentHash('example.com', undefined, 'behavior', null);
      expect(hash1).toBe(hash2);
    });
  });

  describe('generateSummaryHash', () => {
    it('should normalize whitespace', () => {
      const hash1 = generateSummaryHash('test  summary');
      const hash2 = generateSummaryHash('test summary');
      expect(hash1).toBe(hash2);
    });

    it('should be case insensitive', () => {
      const hash1 = generateSummaryHash('Test Summary');
      const hash2 = generateSummaryHash('test summary');
      expect(hash1).toBe(hash2);
    });
  });
});

describe('ID Generators', () => {
  describe('generateObservationId', () => {
    it('should generate valid UUID', () => {
      const id = generateObservationId();
      expect(id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateObservationId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('generateVectorId', () => {
    it('should generate valid UUID', () => {
      const id = generateVectorId();
      expect(id).toMatch(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
    });
  });

  describe('generateSyncBatchId', () => {
    it('should start with sync_ prefix', () => {
      const id = generateSyncBatchId();
      expect(id).toMatch(/^sync_/);
    });

    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateSyncBatchId());
      }
      expect(ids.size).toBe(100);
    });
  });
});

describe('Path Utilities', () => {
  describe('getDefaultDataDir', () => {
    it('should return a string path', () => {
      const dir = getDefaultDataDir();
      expect(typeof dir).toBe('string');
      expect(dir.length).toBeGreaterThan(0);
    });

    it('should end with substrate', () => {
      const dir = getDefaultDataDir();
      expect(dir).toMatch(/substrate$/);
    });
  });

  describe('getDataPaths', () => {
    it('should return all expected paths', () => {
      const paths = getDataPaths('/tmp/substrate');
      expect(paths.root).toBe('/tmp/substrate');
      expect(paths.sqlite).toBe('/tmp/substrate/substrate.db');
      expect(paths.jsonl).toBe('/tmp/substrate/observations.jsonl');
      expect(paths.outbox).toBe('/tmp/substrate/outbox');
      expect(paths.config).toBe('/tmp/substrate/config.json');
      expect(paths.logs).toBe('/tmp/substrate/logs');
    });
  });
});
