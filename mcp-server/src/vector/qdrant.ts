import { QdrantClient } from '@qdrant/js-client-rest';
import type { QdrantConfig, EmbeddingConfig } from '../schemas/config.js';
import type { StoredObservation, ObservationCategory, ObservationStatus } from '../schemas/observation.js';

export interface VectorSearchResult {
  id: string;
  score: number;
  observation_id: string;
}

export interface VectorSearchFilters {
  domain?: string;
  category?: ObservationCategory;
  status?: ObservationStatus;
  min_confidence?: number;
}

/**
 * Qdrant client wrapper for vector operations
 */
export class QdrantStorage {
  private client: QdrantClient;
  private collectionName: string;
  private dimension: number;
  private initialized: boolean = false;

  constructor(qdrantConfig: QdrantConfig, embeddingConfig: EmbeddingConfig) {
    this.client = new QdrantClient({
      url: qdrantConfig.url,
      apiKey: qdrantConfig.api_key,
      checkCompatibility: false, // Skip version check for Railway compatibility
    });
    this.collectionName = qdrantConfig.collection_name;
    this.dimension = embeddingConfig.dimension;
  }

  /**
   * Initialize the collection if it doesn't exist
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Check if collection exists
      const collections = await this.client.getCollections();
      const exists = collections.collections.some(c => c.name === this.collectionName);

      if (!exists) {
        // Create collection with appropriate settings
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.dimension,
            distance: 'Cosine',
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });

        // Create payload indices for filtering
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'domain',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'category',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'status',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'confidence',
          field_schema: 'float',
        });
      }

      this.initialized = true;
    } catch (error) {
      // If Qdrant is not available, log warning but don't fail
      console.warn('Qdrant initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if Qdrant is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.client.getCollections();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Insert or update a vector point
   */
  async upsert(
    vectorId: string,
    embedding: number[],
    observation: StoredObservation
  ): Promise<void> {
    await this.initialize();

    await this.client.upsert(this.collectionName, {
      wait: true,
      points: [
        {
          id: vectorId,
          vector: embedding,
          payload: {
            observation_id: observation.id,
            domain: observation.domain,
            path: observation.path,
            category: observation.category,
            status: observation.status,
            confidence: observation.confidence,
            summary: observation.summary,
            created_at: observation.created_at,
          },
        },
      ],
    });
  }

  /**
   * Batch upsert multiple vectors
   */
  async upsertBatch(
    items: Array<{ vectorId: string; embedding: number[]; observation: StoredObservation }>
  ): Promise<void> {
    await this.initialize();

    const points = items.map(item => ({
      id: item.vectorId,
      vector: item.embedding,
      payload: {
        observation_id: item.observation.id,
        domain: item.observation.domain,
        path: item.observation.path,
        category: item.observation.category,
        status: item.observation.status,
        confidence: item.observation.confidence,
        summary: item.observation.summary,
        created_at: item.observation.created_at,
      },
    }));

    await this.client.upsert(this.collectionName, {
      wait: true,
      points,
    });
  }

  /**
   * Search for similar vectors with optional filters
   */
  async search(
    queryEmbedding: number[],
    limit: number,
    filters?: VectorSearchFilters
  ): Promise<VectorSearchResult[]> {
    await this.initialize();

    // Build filter conditions
    const must: Array<Record<string, unknown>> = [];

    if (filters?.domain) {
      must.push({
        key: 'domain',
        match: { value: filters.domain },
      });
    }

    if (filters?.category) {
      must.push({
        key: 'category',
        match: { value: filters.category },
      });
    }

    if (filters?.status) {
      must.push({
        key: 'status',
        match: { value: filters.status },
      });
    }

    if (filters?.min_confidence !== undefined) {
      must.push({
        key: 'confidence',
        range: { gte: filters.min_confidence },
      });
    }

    const filter = must.length > 0 ? { must } : undefined;

    const results = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit,
      filter,
      with_payload: true,
    });

    return results.map(result => ({
      id: result.id as string,
      score: result.score,
      observation_id: (result.payload as Record<string, unknown>)['observation_id'] as string,
    }));
  }

  /**
   * Delete a vector point
   */
  async delete(vectorId: string): Promise<void> {
    await this.initialize();

    await this.client.delete(this.collectionName, {
      wait: true,
      points: [vectorId],
    });
  }

  /**
   * Get collection info
   */
  async getCollectionInfo(): Promise<{ points_count: number } | null> {
    try {
      await this.initialize();
      const info = await this.client.getCollection(this.collectionName);
      return {
        points_count: info.points_count ?? 0,
      };
    } catch {
      return null;
    }
  }

  /**
   * Update payload for an existing point
   */
  async updatePayload(
    vectorId: string,
    updates: Partial<{ status: string; confidence: number }>
  ): Promise<void> {
    await this.initialize();

    await this.client.setPayload(this.collectionName, {
      wait: true,
      points: [vectorId],
      payload: updates,
    });
  }
}
