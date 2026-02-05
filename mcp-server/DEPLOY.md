# Deploying Substrate MCP Server

## Railway Deployment

### Prerequisites
- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`

### Step 1: Create Qdrant Service

1. Go to Railway Dashboard
2. Create New Project
3. Click "Add Service" → "Database" → Search for "Qdrant"
4. Or use the template: https://railway.app/template/qdrant

Note the internal URL (e.g., `qdrant.railway.internal:6333`)

### Step 2: Deploy MCP Server

**Option A: From GitHub**
1. Push your code to GitHub
2. In Railway, click "Add Service" → "GitHub Repo"
3. Select your repository
4. Railway will auto-detect the Dockerfile

**Option B: From CLI**
```bash
# Login to Railway
railway login

# Initialize project (or link to existing)
railway init

# Deploy
railway up
```

### Step 3: Configure Environment Variables

In Railway Dashboard → Your Service → Variables:

```
SUBSTRATE_TRANSPORT=sse
SUBSTRATE_API_KEY=<generate-secure-key>
SUBSTRATE_QDRANT_URL=http://qdrant.railway.internal:6333
SUBSTRATE_LOG_LEVEL=info
```

Generate a secure API key:
```bash
openssl rand -hex 32
```

### Step 4: Expose the Service

1. Go to Settings → Networking
2. Click "Generate Domain" to get a public URL
3. Or add a custom domain

Your server will be available at:
- SSE endpoint: `https://your-domain.railway.app/sse`
- Health check: `https://your-domain.railway.app/health`

---

## Connecting Agents

### From Claude Desktop (Remote)

Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "substrate": {
      "url": "https://your-domain.railway.app/sse",
      "headers": {
        "X-API-Key": "your-api-key"
      }
    }
  }
}
```

### From Code (MCP Client)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js';

const transport = new SSEClientTransport(
  new URL('https://your-domain.railway.app/sse'),
  {
    requestInit: {
      headers: {
        'X-API-Key': 'your-api-key'
      }
    }
  }
);

const client = new Client({ name: 'my-agent', version: '1.0.0' });
await client.connect(transport);

// Use tools
const result = await client.callTool('substrate_search', {
  query: 'date format validation',
  limit: 10
});
```

---

## Alternative Hosting Options

### Fly.io

```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Launch
fly launch

# Set secrets
fly secrets set SUBSTRATE_API_KEY=your-key
fly secrets set SUBSTRATE_QDRANT_URL=your-qdrant-url
```

### Render

1. Connect GitHub repo
2. Select "Docker" environment
3. Set environment variables in dashboard

### Qdrant Cloud (Managed)

Instead of self-hosting Qdrant:

1. Sign up at https://cloud.qdrant.io
2. Create a cluster
3. Get the URL and API key
4. Set in your MCP server:
   ```
   SUBSTRATE_QDRANT_URL=https://xxx.qdrant.io:6333
   SUBSTRATE_QDRANT_API_KEY=your-qdrant-api-key
   ```

---

## Production Checklist

- [ ] Set strong `SUBSTRATE_API_KEY`
- [ ] Configure CORS origins for your domains
- [ ] Enable persistent storage for SQLite data
- [ ] Set up monitoring/alerts
- [ ] Configure auto-scaling if needed
- [ ] Set up backup for Qdrant data

---

## Local Development with Docker

```bash
# Start everything
docker-compose up -d

# Check logs
docker-compose logs -f substrate

# Stop
docker-compose down
```

Access at `http://localhost:3000`
