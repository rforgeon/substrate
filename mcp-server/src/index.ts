import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createSubstrateServer } from './server.js';
import { createSSEServer } from './transports/sse.js';

async function main() {
  const transportMode = process.env['SUBSTRATE_TRANSPORT'] ?? 'stdio';
  const port = parseInt(process.env['PORT'] ?? process.env['SUBSTRATE_PORT'] ?? '3000', 10);
  const apiKey = process.env['SUBSTRATE_API_KEY'];

  const { server, cleanup } = await createSubstrateServer();

  // Handle shutdown signals
  let sseServer: ReturnType<typeof createSSEServer> | null = null;

  const shutdown = () => {
    console.log('Shutting down...');
    if (sseServer) sseServer.stop();
    cleanup();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  if (transportMode === 'sse' || transportMode === 'http') {
    // HTTP/SSE transport for remote access
    sseServer = createSSEServer(server, {
      port,
      apiKey,
      corsOrigins: process.env['SUBSTRATE_CORS_ORIGINS']?.split(',') ?? ['*'],
    });

    await sseServer.start();
    console.log('Substrate MCP server running in SSE mode');

    if (apiKey) {
      console.log('API key authentication enabled');
    } else {
      console.warn('WARNING: No API key set. Server is publicly accessible.');
      console.warn('Set SUBSTRATE_API_KEY environment variable for production.');
    }
  } else {
    // Stdio transport for local Claude Desktop
    const transport = new StdioServerTransport();
    await server.connect(transport);
  }
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Re-export for programmatic usage
export { createSubstrateServer } from './server.js';
export type { SubstrateContext } from './server.js';
export * from './schemas/index.js';
export * from './storage/index.js';
export * from './vector/index.js';
export * from './confirmation/index.js';
export * from './sync/index.js';
