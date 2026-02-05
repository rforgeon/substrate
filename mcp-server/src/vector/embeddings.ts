import type { EmbeddingConfig } from '../schemas/config.js';

// Use dynamic imports to handle the transformers library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any = null;

/**
 * Embedding generator using Transformers.js
 */
export class EmbeddingGenerator {
  private config: EmbeddingConfig;
  private initialized: boolean = false;

  constructor(config: EmbeddingConfig) {
    this.config = config;
  }

  /**
   * Initialize the embedding pipeline
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    const { pipeline } = await import('@xenova/transformers');
    embeddingPipeline = await pipeline('feature-extraction', this.config.model, {
      quantized: true,
    });
    this.initialized = true;
  }

  /**
   * Generate embedding for a single text
   */
  async embed(text: string): Promise<number[]> {
    await this.initialize();

    if (!embeddingPipeline) {
      throw new Error('Embedding pipeline not initialized');
    }

    const output = await embeddingPipeline(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding array - output is a Tensor with data property
    const tensor = output as { data: Float32Array };
    return Array.from(tensor.data);
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedBatch(texts: string[]): Promise<number[][]> {
    await this.initialize();

    if (!embeddingPipeline) {
      throw new Error('Embedding pipeline not initialized');
    }

    const results: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += this.config.batch_size) {
      const batch = texts.slice(i, i + this.config.batch_size);
      const batchResults = await Promise.all(batch.map(text => this.embed(text)));
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get the dimension of the embeddings
   */
  getDimension(): number {
    return this.config.dimension;
  }

  /**
   * Create searchable text from observation fields
   */
  static createSearchableText(
    domain: string,
    path: string | undefined,
    category: string,
    summary: string,
    structuredData?: Record<string, unknown>
  ): string {
    const parts = [
      `domain: ${domain}`,
      path ? `path: ${path}` : '',
      `category: ${category}`,
      summary,
    ];

    // Add key-value pairs from structured data
    if (structuredData) {
      for (const [key, value] of Object.entries(structuredData)) {
        if (value !== undefined && value !== null) {
          parts.push(`${key}: ${String(value)}`);
        }
      }
    }

    return parts.filter(Boolean).join(' | ');
  }
}
