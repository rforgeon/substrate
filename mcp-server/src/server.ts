import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Storage } from './storage/index.js';
import { VectorSearch } from './vector/index.js';
import { ConfirmationEngine } from './confirmation/index.js';
import { SyncCoordinator } from './sync/index.js';
import type { SubstrateConfig } from './schemas/config.js';
import { createDefaultConfig, configFromEnv } from './schemas/config.js';
import { getDefaultDataDir } from './utils/paths.js';
import { createConsoleLogger, type Logger } from './types/index.js';

// Tool handlers
import { registerObserveTool } from './tools/observe.js';
import { registerLookupTool } from './tools/lookup.js';
import { registerSearchTool } from './tools/search.js';
import { registerFailuresTool } from './tools/failures.js';
import { registerConfirmTool } from './tools/confirm.js';
import { registerStatsTool } from './tools/stats.js';
import { registerSemanticSearchTool } from './tools/semantic-search.js';
import { registerReportImpactTool } from './tools/report-impact.js';

// Resource handlers
import { registerDomainsResource } from './resources/domains.js';
import { registerDomainResource } from './resources/domain.js';
import { registerFailuresResource } from './resources/failures.js';
import { registerStatsResource } from './resources/stats.js';

export interface SubstrateContext {
  storage: Storage;
  vectorSearch: VectorSearch;
  confirmationEngine: ConfirmationEngine;
  syncCoordinator: SyncCoordinator;
  config: SubstrateConfig;
  logger: Logger;
  agentHash: string;
}

/**
 * Create and configure the Substrate MCP server
 */
export async function createSubstrateServer(
  userConfig?: Partial<SubstrateConfig>
): Promise<{ server: McpServer; context: SubstrateContext; cleanup: () => void }> {
  // Build configuration
  const dataDir = userConfig?.data_dir ?? getDefaultDataDir();
  const baseConfig = createDefaultConfig(dataDir);
  const envConfig = configFromEnv(baseConfig);
  const config: SubstrateConfig = { ...envConfig, ...userConfig };

  // Create logger
  const logger = createConsoleLogger(config.log_level);
  logger.info('Initializing Substrate MCP server...');

  // Initialize storage
  const storage = new Storage(config);
  logger.info('Storage initialized');

  // Initialize vector search
  const vectorSearch = new VectorSearch(config);
  const vectorAvailable = await vectorSearch.initialize();
  if (vectorAvailable) {
    logger.info('Vector search initialized');
  } else {
    logger.warn('Vector search not available - Qdrant may not be running');
  }

  // Initialize confirmation engine
  const confirmationConfig = config.confirmation ?? {
    threshold: 3,
    confidence_factor: 6,
    contradiction_window_hours: 24,
    stale_after_days: 30,
  };
  const confirmationEngine = new ConfirmationEngine(storage, confirmationConfig, vectorSearch);
  logger.info('Confirmation engine initialized');

  // Initialize sync coordinator
  const syncConfig = config.sync ?? {
    enabled: false,
    interval_ms: 60000,
    urgent_interval_ms: 5000,
    outbox_path: `${dataDir}/outbox`,
    peers: [],
  };
  const syncCoordinator = new SyncCoordinator(storage, syncConfig, confirmationEngine, vectorSearch);
  if (syncConfig.enabled) {
    syncCoordinator.start();
    logger.info('Sync coordinator started');
  }

  // Generate agent hash
  const { hashAgentId } = await import('./utils/hash.js');
  const agentId = config.agent_id ?? `substrate-server-${Date.now()}`;
  const agentHash = hashAgentId(agentId);

  // Create context
  const context: SubstrateContext = {
    storage,
    vectorSearch,
    confirmationEngine,
    syncCoordinator,
    config,
    logger,
    agentHash,
  };

  // Create MCP server
  const server = new McpServer({
    name: 'substrate',
    version: '0.2.0',
  });

  // Register tools
  registerObserveTool(server, context);
  registerLookupTool(server, context);
  registerSearchTool(server, context);
  registerFailuresTool(server, context);
  registerConfirmTool(server, context);
  registerStatsTool(server, context);
  registerSemanticSearchTool(server, context);
  registerReportImpactTool(server, context);

  // Register resources
  registerDomainsResource(server, context);
  registerDomainResource(server, context);
  registerFailuresResource(server, context);
  registerStatsResource(server, context);

  logger.info('Substrate MCP server ready');

  // Cleanup function
  const cleanup = () => {
    logger.info('Shutting down Substrate MCP server...');
    syncCoordinator.stop();
    storage.close();
    logger.info('Shutdown complete');
  };

  return { server, context, cleanup };
}

export { McpServer };
