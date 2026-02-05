# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Install build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Install runtime dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Rebuild better-sqlite3 for this platform
RUN npm rebuild better-sqlite3

# Copy built files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/skill ./skill

# Create data directory
RUN mkdir -p /data

# Environment variables
ENV NODE_ENV=production
ENV SUBSTRATE_TRANSPORT=sse
ENV SUBSTRATE_DATA_DIR=/data
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:3000/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

CMD ["node", "dist/index.js"]
