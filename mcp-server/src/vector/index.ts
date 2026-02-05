import { EmbeddingGenerator } from './embeddings.js';
import { QdrantStorage, type VectorSearchFilters, type VectorSearchResult } from './qdrant.js';
import type { StoredObservation } from '../schemas/observation.js';
import type { SubstrateConfig } from '../schemas/config.js';
import { generateVectorId } from '../utils/id-generator.js';

export interface VectorSearchOptions extends VectorSearchFilters {
  limit?: number;
}

/**
 * Vector search facade coordinating embeddings and Qdrant
 */
export class VectorSearch {
  private embeddings: EmbeddingGenerator;
  private qdrant: QdrantStorage;
  private initialized: boolean = false;
  private available: boolean = false;

  constructor(config: SubstrateConfig) {
    const embeddingConfig = config.embedding ?? {
      model: 'Xenova/all-MiniLM-L6-v2',
      dimension: 384,
      batch_size: 32,
    };

    const qdrantConfig = config.qdrant ?? {
      url: 'http://localhost:6333',
      collection_name: 'substrate_observations',
    };

    this.embeddings = new EmbeddingGenerator(embeddingConfig);
    this.qdrant = new QdrantStorage(qdrantConfig, embeddingConfig);
  }

  /**
   * Initialize vector search components
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return this.available;

    try {
      // Check Qdrant availability first
      this.available = await this.qdrant.isAvailable();

      if (this.available) {
        // Initialize embedding model and Qdrant collection
        await Promise.all([
          this.embeddings.initialize(),
          this.qdrant.initialize(),
        ]);
      } else {
        console.warn('Qdrant not available - vector search disabled');
      }

      this.initialized = true;
      return this.available;
    } catch (error) {
      console.warn('Vector search initialization failed:', error);
      this.initialized = true;
      this.available = false;
      return false;
    }
  }

  /**
   * Check if vector search is available
   */
  isAvailable(): boolean {
    return this.available;
  }

  /**
   * Index an observation for vector search
   * Returns the vector ID if successful
   */
  async index(observation: StoredObservation): Promise<string | undefined> {
    if (!this.available) {
      await this.initialize();
      if (!this.available) return undefined;
    }

    try {
      const text = EmbeddingGenerator.createSearchableText(
        observation.domain,
        observation.path,
        observation.category,
        observation.summary,
        observation.structured_data as Record<string, unknown> | undefined
      );

      const embedding = await this.embeddings.embed(text);
      const vectorId = observation.vector_id ?? generateVectorId();

      await this.qdrant.upsert(vectorId, embedding, observation);

      return vectorId;
    } catch (error) {
      console.warn('Vector indexing failed:', error);
      return undefined;
    }
  }

  /**
   * Index multiple observations in batch
   */
  async indexBatch(observations: StoredObservation[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();

    if (!this.available) {
      await this.initialize();
      if (!this.available) return results;
    }

    try {
      // Generate texts for embedding
      const texts = observations.map(obs =>
        EmbeddingGenerator.createSearchableText(
          obs.domain,
          obs.path,
          obs.category,
          obs.summary,
          obs.structured_data as Record<string, unknown> | undefined
        )
      );

      // Batch embed
      const embeddings = await this.embeddings.embedBatch(texts);

      // Prepare items for upsert
      const items = observations.map((obs, i) => {
        const vectorId = obs.vector_id ?? generateVectorId();
        results.set(obs.id, vectorId);
        return {
          vectorId,
          embedding: embeddings[i]!,
          observation: obs,
        };
      });

      // Batch upsert
      await this.qdrant.upsertBatch(items);

      return results;
    } catch (error) {
      console.warn('Batch vector indexing failed:', error);
      return results;
    }
  }

  /**
   * Search for similar observations
   */
  async search(
    query: string,
    options: VectorSearchOptions = {}
  ): Promise<{ results: VectorSearchResult[]; embedding_time_ms: number; search_time_ms: number }> {
    if (!this.available) {
      await this.initialize();
      if (!this.available) {
        return { results: [], embedding_time_ms: 0, search_time_ms: 0 };
      }
    }

    const embedStart = Date.now();
    const queryEmbedding = await this.embeddings.embed(query);
    const embedding_time_ms = Date.now() - embedStart;

    const searchStart = Date.now();
    const results = await this.qdrant.search(
      queryEmbedding,
      options.limit ?? 10,
      {
        domain: options.domain,
        category: options.category,
        status: options.status,
        min_confidence: options.min_confidence,
      }
    );
    const search_time_ms = Date.now() - searchStart;

    return { results, embedding_time_ms, search_time_ms };
  }

  /**
   * Update vector payload (e.g., when observation status changes)
   */
  async updatePayload(
    vectorId: string,
    updates: { status?: string; confidence?: number }
  ): Promise<void> {
    if (!this.available) return;

    try {
      await this.qdrant.updatePayload(vectorId, updates);
    } catch (error) {
      console.warn('Vector payload update failed:', error);
    }
  }

  /**
   * Delete a vector
   */
  async delete(vectorId: string): Promise<void> {
    if (!this.available) return;

    try {
      await this.qdrant.delete(vectorId);
    } catch (error) {
      console.warn('Vector deletion failed:', error);
    }
  }

  /**
   * Get vector index statistics
   */
  async getStats(): Promise<{ points_count: number } | null> {
    if (!this.available) return null;

    try {
      return await this.qdrant.getCollectionInfo();
    } catch {
      return null;
    }
  }
}

export { EmbeddingGenerator } from './embeddings.js';
export { QdrantStorage } from './qdrant.js';
export type { VectorSearchResult, VectorSearchFilters } from './qdrant.js';
