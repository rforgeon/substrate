import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

export interface SSEServerOptions {
  port: number;
  host?: string;
  apiKey?: string;
  corsOrigins?: string[];
}

/**
 * Create an HTTP server with SSE transport for remote MCP access
 */
export function createSSEServer(
  mcpServer: McpServer,
  options: SSEServerOptions
): { start: () => Promise<void>; stop: () => void } {
  const { port, host = '0.0.0.0', apiKey, corsOrigins = ['*'] } = options;

  let httpServer: ReturnType<typeof createServer> | null = null;
  let sseTransport: SSEServerTransport | null = null;

  const setCorsHeaders = (res: ServerResponse) => {
    res.setHeader('Access-Control-Allow-Origin', corsOrigins.join(', '));
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
  };

  const authenticate = (req: IncomingMessage): boolean => {
    if (!apiKey) return true;

    const authHeader = req.headers['authorization'];
    const apiKeyHeader = req.headers['x-api-key'];

    if (authHeader === `Bearer ${apiKey}`) return true;
    if (apiKeyHeader === apiKey) return true;

    return false;
  };

  const handleRequest = async (req: IncomingMessage, res: ServerResponse) => {
    setCorsHeaders(res);

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint
    if (req.url === '/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', transport: 'sse' }));
      return;
    }

    // Authenticate
    if (!authenticate(req)) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized' }));
      return;
    }

    // SSE endpoint for MCP
    if (req.url === '/sse' && req.method === 'GET') {
      // Create new transport for this connection
      sseTransport = new SSEServerTransport('/message', res);
      await mcpServer.connect(sseTransport);
      return;
    }

    // Message endpoint for client-to-server messages
    if (req.url === '/message' && req.method === 'POST') {
      if (!sseTransport) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No active SSE connection' }));
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          await sseTransport!.handlePostMessage(req, res, body);
        } catch (error) {
          console.error('Error handling message:', error);
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Internal server error' }));
          }
        }
      });
      return;
    }

    // 404 for unknown routes
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  };

  return {
    start: () => new Promise<void>((resolve, reject) => {
      httpServer = createServer(handleRequest);

      httpServer.on('error', reject);

      httpServer.listen(port, host, () => {
        console.log(`MCP SSE server listening on http://${host}:${port}`);
        console.log(`  SSE endpoint: http://${host}:${port}/sse`);
        console.log(`  Health check: http://${host}:${port}/health`);
        resolve();
      });
    }),

    stop: () => {
      if (httpServer) {
        httpServer.close();
        httpServer = null;
      }
    },
  };
}
