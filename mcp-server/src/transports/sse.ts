import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { URL } from 'node:url';
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
  // Store transports by session ID for multiple concurrent connections
  const transports = new Map<string, SSEServerTransport>();

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

    // Parse URL to handle query parameters
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const pathname = url.pathname;

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    // Health check endpoint
    if (pathname === '/health' && req.method === 'GET') {
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
    if (pathname === '/sse' && req.method === 'GET') {
      // Create new transport for this connection
      const transport = new SSEServerTransport('/message', res);

      // Store transport by session ID once available
      transport.onclose = () => {
        // Clean up when connection closes
        for (const [id, t] of transports.entries()) {
          if (t === transport) {
            transports.delete(id);
            break;
          }
        }
      };

      // Generate a session ID and store the transport
      const sessionId = crypto.randomUUID();
      transports.set(sessionId, transport);

      await mcpServer.connect(transport);
      return;
    }

    // Message endpoint for client-to-server messages
    if (pathname === '/message' && req.method === 'POST') {
      // Get session ID from query param
      const sessionId = url.searchParams.get('sessionId');

      // Try to find the transport - check by sessionId first, then fall back to any active transport
      let transport: SSEServerTransport | undefined;
      if (sessionId) {
        transport = transports.get(sessionId);
      }
      // Fall back to most recent transport if no sessionId or not found
      if (!transport && transports.size > 0) {
        transport = Array.from(transports.values()).pop();
      }

      if (!transport) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No active SSE connection' }));
        return;
      }

      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', async () => {
        try {
          await transport!.handlePostMessage(req, res, body);
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
