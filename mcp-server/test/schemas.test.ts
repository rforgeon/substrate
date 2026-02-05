import { describe, it, expect } from 'vitest';
import {
  ObservationCategory,
  ObservationStatus,
  UrgencyLevel,
  Observation,
  CreateObservation,
  BehaviorData,
  ErrorData,
  AuthData,
  RateLimitData,
  FormatData,
} from '../src/schemas/observation.js';
import { ObserveInput, LookupInput, SearchInput } from '../src/schemas/tools.js';
import { SubstrateConfig, createDefaultConfig } from '../src/schemas/config.js';

describe('Observation Schemas', () => {
  describe('ObservationCategory', () => {
    it('should accept valid categories', () => {
      expect(ObservationCategory.parse('behavior')).toBe('behavior');
      expect(ObservationCategory.parse('error')).toBe('error');
      expect(ObservationCategory.parse('auth')).toBe('auth');
      expect(ObservationCategory.parse('rate_limit')).toBe('rate_limit');
      expect(ObservationCategory.parse('format')).toBe('format');
    });

    it('should reject invalid categories', () => {
      expect(() => ObservationCategory.parse('invalid')).toThrow();
    });
  });

  describe('ObservationStatus', () => {
    it('should accept valid statuses', () => {
      expect(ObservationStatus.parse('pending')).toBe('pending');
      expect(ObservationStatus.parse('confirmed')).toBe('confirmed');
      expect(ObservationStatus.parse('contradicted')).toBe('contradicted');
      expect(ObservationStatus.parse('stale')).toBe('stale');
    });
  });

  describe('UrgencyLevel', () => {
    it('should accept valid urgency levels', () => {
      expect(UrgencyLevel.parse('normal')).toBe('normal');
      expect(UrgencyLevel.parse('high')).toBe('high');
      expect(UrgencyLevel.parse('critical')).toBe('critical');
    });
  });

  describe('Structured Data Schemas', () => {
    it('should parse BehaviorData', () => {
      const data = {
        element: 'submit-button',
        action: 'click',
        expected_result: 'form submits',
        actual_result: 'nothing happens',
        workaround: 'enable JavaScript',
      };
      expect(BehaviorData.parse(data)).toEqual(data);
    });

    it('should parse ErrorData', () => {
      const data = {
        error_code: '429',
        error_message: 'Too Many Requests',
        trigger: 'exceeding rate limit',
        resolution: 'wait 60 seconds',
        recoverable: true,
      };
      expect(ErrorData.parse(data)).toEqual(data);
    });

    it('should parse AuthData', () => {
      const data = {
        method: 'oauth',
        header: 'Authorization',
        token_location: 'header',
        session_duration: '24h',
      };
      expect(AuthData.parse(data)).toEqual(data);
    });

    it('should parse RateLimitData', () => {
      const data = {
        limit: 100,
        window: '1m',
        header_remaining: 'X-RateLimit-Remaining',
        header_reset: 'X-RateLimit-Reset',
      };
      expect(RateLimitData.parse(data)).toEqual(data);
    });

    it('should parse FormatData', () => {
      const data = {
        field: 'date_of_birth',
        format: 'DD/MM/YYYY',
        validation_regex: '^\\d{2}/\\d{2}/\\d{4}$',
        required: true,
      };
      expect(FormatData.parse(data)).toEqual(data);
    });
  });

  describe('CreateObservation', () => {
    it('should parse minimal observation', () => {
      const input = {
        domain: 'api.example.com',
        category: 'behavior',
        summary: 'Test observation',
      };
      const result = CreateObservation.parse(input);
      expect(result.domain).toBe('api.example.com');
      expect(result.category).toBe('behavior');
      expect(result.summary).toBe('Test observation');
    });

    it('should parse full observation', () => {
      const input = {
        domain: 'api.example.com',
        path: '/v2/users',
        category: 'rate_limit',
        summary: 'Rate limited to 100 req/min',
        structured_data: { limit: 100, window: '1m' },
        urgency: 'normal',
        tags: ['api', 'limits'],
      };
      const result = CreateObservation.parse(input);
      expect(result).toEqual(input);
    });

    it('should reject empty domain', () => {
      expect(() =>
        CreateObservation.parse({
          domain: '',
          category: 'behavior',
          summary: 'Test',
        })
      ).toThrow();
    });

    it('should reject summary over 2000 chars', () => {
      expect(() =>
        CreateObservation.parse({
          domain: 'example.com',
          category: 'behavior',
          summary: 'x'.repeat(2001),
        })
      ).toThrow();
    });
  });

  describe('Observation', () => {
    it('should apply defaults', () => {
      const input = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        agent_hash: 'abc123',
        domain: 'example.com',
        category: 'behavior',
        summary: 'Test',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      const result = Observation.parse(input);
      expect(result.status).toBe('pending');
      expect(result.confirmations).toBe(1);
      expect(result.confirming_agents).toEqual([]);
      expect(result.confidence).toBe(0);
      expect(result.urgency).toBe('normal');
      expect(result.tags).toEqual([]);
    });
  });
});

describe('Tool Schemas', () => {
  describe('ObserveInput', () => {
    it('should parse valid input', () => {
      const input = {
        domain: 'api.example.com',
        category: 'error',
        summary: 'Returns 500 on invalid JSON',
      };
      expect(ObserveInput.parse(input)).toMatchObject(input);
    });
  });

  describe('LookupInput', () => {
    it('should parse with defaults', () => {
      const result = LookupInput.parse({ domain: 'example.com' });
      expect(result.domain).toBe('example.com');
      expect(result.limit).toBe(20);
    });

    it('should validate limit range', () => {
      expect(() => LookupInput.parse({ domain: 'example.com', limit: 0 })).toThrow();
      expect(() => LookupInput.parse({ domain: 'example.com', limit: 101 })).toThrow();
    });
  });

  describe('SearchInput', () => {
    it('should parse with defaults', () => {
      const result = SearchInput.parse({ query: 'test query' });
      expect(result.query).toBe('test query');
      expect(result.limit).toBe(10);
    });

    it('should validate confidence range', () => {
      expect(() => SearchInput.parse({ query: 'test', min_confidence: -0.1 })).toThrow();
      expect(() => SearchInput.parse({ query: 'test', min_confidence: 1.1 })).toThrow();
    });
  });
});

describe('Config Schemas', () => {
  describe('createDefaultConfig', () => {
    it('should create valid default config', () => {
      const config = createDefaultConfig('/tmp/substrate');
      expect(SubstrateConfig.parse(config)).toEqual(config);
      expect(config.data_dir).toBe('/tmp/substrate');
      expect(config.confirmation?.threshold).toBe(3);
      expect(config.qdrant?.url).toBe('http://localhost:6333');
    });
  });
});
