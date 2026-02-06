#!/usr/bin/env node
'use strict';

var crypto = require('crypto');
var stdio_js = require('@modelcontextprotocol/sdk/server/stdio.js');
var mcp_js = require('@modelcontextprotocol/sdk/server/mcp.js');
var Database = require('better-sqlite3');
var fs = require('fs');
var path = require('path');
var os = require('os');
var jsClientRest = require('@qdrant/js-client-rest');
var zod = require('zod');
var http = require('http');
var sse_js = require('@modelcontextprotocol/sdk/server/sse.js');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var Database__default = /*#__PURE__*/_interopDefault(Database);

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/utils/hash.ts
var hash_exports = {};
__export(hash_exports, {
  generateContentHash: () => generateContentHash,
  generateSummaryHash: () => generateSummaryHash,
  hashAgentId: () => hashAgentId,
  sha256: () => sha256
});
function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}
function hashAgentId(agentId) {
  return sha256(`substrate:agent:${agentId}`);
}
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  return sorted;
}
function generateContentHash(domain, path, category, structuredData) {
  const canonical = {
    category,
    domain: domain.toLowerCase(),
    path: path?.toLowerCase() ?? "",
    structured_data: sortObjectKeys(structuredData) ?? null
  };
  return sha256(JSON.stringify(canonical));
}
function generateSummaryHash(summary) {
  const normalized = summary.toLowerCase().replace(/\s+/g, " ").trim();
  return sha256(normalized);
}
var init_hash = __esm({
  "src/utils/hash.ts"() {
  }
});

// src/storage/migrations/001_initial.ts
var initial_exports = {};
__export(initial_exports, {
  down: () => down,
  up: () => up,
  version: () => version
});
var version = 1;
function up(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      agent_hash TEXT NOT NULL,
      domain TEXT NOT NULL,
      path TEXT,
      category TEXT NOT NULL,
      summary TEXT NOT NULL,
      structured_data TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      confirmations INTEGER NOT NULL DEFAULT 1,
      confirming_agents TEXT NOT NULL DEFAULT '[]',
      confidence REAL NOT NULL DEFAULT 0,
      urgency TEXT NOT NULL DEFAULT 'normal',
      tags TEXT NOT NULL DEFAULT '[]',
      content_hash TEXT NOT NULL,
      vector_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      expires_at TEXT
    );

    -- Indices for common queries
    CREATE INDEX IF NOT EXISTS idx_observations_domain ON observations(domain);
    CREATE INDEX IF NOT EXISTS idx_observations_domain_path ON observations(domain, path);
    CREATE INDEX IF NOT EXISTS idx_observations_category ON observations(category);
    CREATE INDEX IF NOT EXISTS idx_observations_status ON observations(status);
    CREATE INDEX IF NOT EXISTS idx_observations_content_hash ON observations(content_hash);
    CREATE INDEX IF NOT EXISTS idx_observations_created_at ON observations(created_at);
    CREATE INDEX IF NOT EXISTS idx_observations_urgency ON observations(urgency);

    -- Composite index for confirmation grouping
    CREATE INDEX IF NOT EXISTS idx_observations_aggregation
      ON observations(domain, path, category, content_hash);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS confirmation_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      path TEXT,
      category TEXT NOT NULL,
      content_hash TEXT NOT NULL,
      canonical_observation_id TEXT NOT NULL,
      total_confirmations INTEGER NOT NULL DEFAULT 1,
      unique_agents TEXT NOT NULL DEFAULT '[]',
      status TEXT NOT NULL DEFAULT 'pending',
      confidence REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(domain, path, category, content_hash)
    );

    CREATE INDEX IF NOT EXISTS idx_confirmation_groups_lookup
      ON confirmation_groups(domain, path, category, content_hash);
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_state (
      peer_name TEXT PRIMARY KEY,
      last_sync_at TEXT,
      last_observation_id TEXT,
      sync_count INTEGER NOT NULL DEFAULT 0
    );
  `);
  db.exec(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR REPLACE INTO metadata (key, value) VALUES ('schema_version', '1');
  `);
}
function down(db) {
  db.exec(`
    DROP TABLE IF EXISTS observations;
    DROP TABLE IF EXISTS confirmation_groups;
    DROP TABLE IF EXISTS sync_state;
    DROP TABLE IF EXISTS metadata;
  `);
}

// src/storage/migrations/002_impact_tracking.ts
var impact_tracking_exports = {};
__export(impact_tracking_exports, {
  down: () => down2,
  up: () => up2,
  version: () => version2
});
var version2 = 2;
function up2(db) {
  db.exec(`
    ALTER TABLE observations ADD COLUMN impact_estimate TEXT;
    ALTER TABLE observations ADD COLUMN impact_reports TEXT NOT NULL DEFAULT '[]';
    ALTER TABLE observations ADD COLUMN impact_stats TEXT;
  `);
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_observations_impact
      ON observations(json_extract(impact_stats, '$.total_uses'));
  `);
  db.exec(`
    UPDATE metadata SET value = '2' WHERE key = 'schema_version';
  `);
}
function down2(db) {
  db.exec(`
    UPDATE metadata SET value = '1' WHERE key = 'schema_version';
  `);
}

// src/storage/migrations/index.ts
var migrations = [
  initial_exports,
  impact_tracking_exports
];
function getCurrentVersion(db) {
  try {
    const row = db.prepare("SELECT value FROM metadata WHERE key = ?").get("schema_version");
    return row ? parseInt(row.value, 10) : 0;
  } catch {
    return 0;
  }
}
function runMigrations(db) {
  const currentVersion = getCurrentVersion(db);
  for (const migration of migrations) {
    if (migration.version > currentVersion) {
      db.transaction(() => {
        migration.up(db);
        db.prepare("INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)").run("schema_version", migration.version.toString());
      })();
    }
  }
}

// src/storage/sqlite.ts
var SQLiteStorage = class {
  db;
  constructor(dbPath) {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    this.db = new Database__default.default(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    runMigrations(this.db);
  }
  // ============================================================================
  // Observation CRUD
  // ============================================================================
  insertObservation(observation) {
    const stmt = this.db.prepare(`
      INSERT INTO observations (
        id, agent_hash, domain, path, category, summary, structured_data,
        status, confirmations, confirming_agents, confidence, urgency, tags,
        content_hash, vector_id, created_at, updated_at, expires_at,
        impact_estimate, impact_reports, impact_stats
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
    `);
    stmt.run(
      observation.id,
      observation.agent_hash,
      observation.domain,
      observation.path ?? null,
      observation.category,
      observation.summary,
      observation.structured_data ? JSON.stringify(observation.structured_data) : null,
      observation.status,
      observation.confirmations,
      JSON.stringify(observation.confirming_agents),
      observation.confidence,
      observation.urgency,
      JSON.stringify(observation.tags),
      observation.content_hash,
      observation.vector_id ?? null,
      observation.created_at,
      observation.updated_at,
      observation.expires_at ?? null,
      observation.impact_estimate ? JSON.stringify(observation.impact_estimate) : null,
      JSON.stringify(observation.impact_reports ?? []),
      observation.impact_stats ? JSON.stringify(observation.impact_stats) : null
    );
  }
  getObservation(id) {
    const row = this.db.prepare("SELECT * FROM observations WHERE id = ?").get(id);
    return row ? this.rowToObservation(row) : null;
  }
  updateObservation(id, updates) {
    const current = this.getObservation(id);
    if (!current) return;
    const updated = { ...current, ...updates, updated_at: (/* @__PURE__ */ new Date()).toISOString() };
    const stmt = this.db.prepare(`
      UPDATE observations SET
        status = ?, confirmations = ?, confirming_agents = ?, confidence = ?,
        updated_at = ?, vector_id = ?,
        impact_estimate = ?, impact_reports = ?, impact_stats = ?
      WHERE id = ?
    `);
    stmt.run(
      updated.status,
      updated.confirmations,
      JSON.stringify(updated.confirming_agents),
      updated.confidence,
      updated.updated_at,
      updated.vector_id ?? null,
      updated.impact_estimate ? JSON.stringify(updated.impact_estimate) : null,
      JSON.stringify(updated.impact_reports ?? []),
      updated.impact_stats ? JSON.stringify(updated.impact_stats) : null,
      id
    );
  }
  /**
   * Add an impact report to an observation and update aggregated stats
   */
  addImpactReport(id, report) {
    const observation = this.getObservation(id);
    if (!observation) {
      return { success: false };
    }
    const reports = observation.impact_reports ?? [];
    reports.push({
      ...report,
      reported_at: (/* @__PURE__ */ new Date()).toISOString()
    });
    const totalUses = reports.length;
    const helpfulCount = reports.filter((r) => r.helpful).length;
    const successReports = reports.filter((r) => r.task_succeeded !== void 0);
    const successCount = successReports.filter((r) => r.task_succeeded).length;
    const timeReports = reports.filter((r) => r.actual_time_saved_seconds !== void 0);
    const avgTimeSaved = timeReports.length > 0 ? timeReports.reduce((sum, r) => sum + (r.actual_time_saved_seconds ?? 0), 0) / timeReports.length : void 0;
    const updatedStats = {
      total_uses: totalUses,
      helpful_count: helpfulCount,
      avg_time_saved_seconds: avgTimeSaved,
      success_rate: successReports.length > 0 ? successCount / successReports.length * 100 : void 0
    };
    this.updateObservation(id, {
      impact_reports: reports,
      impact_stats: updatedStats
    });
    return { success: true, updated_stats: updatedStats };
  }
  queryObservations(options) {
    let sql = "SELECT * FROM observations WHERE 1=1";
    const params = [];
    if (options.domain) {
      sql += " AND domain = ?";
      params.push(options.domain);
    }
    if (options.path) {
      sql += " AND path = ?";
      params.push(options.path);
    }
    if (options.category) {
      sql += " AND category = ?";
      params.push(options.category);
    }
    if (options.status) {
      sql += " AND status = ?";
      params.push(options.status);
    }
    if (options.since) {
      sql += " AND created_at >= ?";
      params.push(options.since);
    }
    sql += " ORDER BY created_at DESC";
    if (options.limit) {
      sql += " LIMIT ?";
      params.push(options.limit);
    }
    if (options.offset) {
      sql += " OFFSET ?";
      params.push(options.offset);
    }
    const rows = this.db.prepare(sql).all(...params);
    return rows.map((row) => this.rowToObservation(row));
  }
  countObservations(options) {
    let sql = "SELECT COUNT(*) as count FROM observations WHERE 1=1";
    const params = [];
    if (options.domain) {
      sql += " AND domain = ?";
      params.push(options.domain);
    }
    if (options.path) {
      sql += " AND path = ?";
      params.push(options.path);
    }
    if (options.category) {
      sql += " AND category = ?";
      params.push(options.category);
    }
    if (options.status) {
      sql += " AND status = ?";
      params.push(options.status);
    }
    const row = this.db.prepare(sql).get(...params);
    return row.count;
  }
  // ============================================================================
  // Confirmation Groups
  // ============================================================================
  findConfirmationGroup(domain, path, category, contentHash) {
    const row = this.db.prepare(`
      SELECT * FROM confirmation_groups
      WHERE domain = ? AND path IS ? AND category = ? AND content_hash = ?
    `).get(domain, path ?? null, category, contentHash);
    return row ? this.rowToConfirmationGroup(row) : null;
  }
  createConfirmationGroup(domain, path, category, contentHash, observationId, agentHash) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    this.db.prepare(`
      INSERT INTO confirmation_groups (
        domain, path, category, content_hash, canonical_observation_id,
        total_confirmations, unique_agents, status, confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, 'pending', 0, ?, ?)
    `).run(domain, path ?? null, category, contentHash, observationId, JSON.stringify([agentHash]), now, now);
    return this.findConfirmationGroup(domain, path, category, contentHash);
  }
  updateConfirmationGroup(id, updates) {
    const now = (/* @__PURE__ */ new Date()).toISOString();
    if (updates.total_confirmations !== void 0 || updates.unique_agents !== void 0) {
      this.db.prepare(`
        UPDATE confirmation_groups
        SET total_confirmations = COALESCE(?, total_confirmations),
            unique_agents = COALESCE(?, unique_agents),
            status = COALESCE(?, status),
            confidence = COALESCE(?, confidence),
            updated_at = ?
        WHERE id = ?
      `).run(
        updates.total_confirmations ?? null,
        updates.unique_agents ? JSON.stringify(updates.unique_agents) : null,
        updates.status ?? null,
        updates.confidence ?? null,
        now,
        id
      );
    }
  }
  // ============================================================================
  // Statistics
  // ============================================================================
  getStats(domain) {
    const whereClause = domain ? "WHERE domain = ?" : "";
    const params = domain ? [domain] : [];
    const totalRow = this.db.prepare(`SELECT COUNT(*) as count FROM observations ${whereClause}`).get(...params);
    const statusRows = this.db.prepare(`
      SELECT status, COUNT(*) as count FROM observations ${whereClause} GROUP BY status
    `).all(...params);
    const categoryRows = this.db.prepare(`
      SELECT category, COUNT(*) as count FROM observations ${whereClause} GROUP BY category
    `).all(...params);
    const domainsRow = this.db.prepare("SELECT COUNT(DISTINCT domain) as count FROM observations").get();
    const topDomainsRows = this.db.prepare(`
      SELECT domain, COUNT(*) as count FROM observations
      GROUP BY domain ORDER BY count DESC LIMIT 10
    `).all();
    return {
      total_observations: totalRow.count,
      observations_by_status: Object.fromEntries(statusRows.map((r) => [r.status, r.count])),
      observations_by_category: Object.fromEntries(categoryRows.map((r) => [r.category, r.count])),
      domains_count: domainsRow.count,
      top_domains: topDomainsRows
    };
  }
  getAllDomains() {
    const rows = this.db.prepare(`
      SELECT domain, COUNT(*) as count FROM observations
      GROUP BY domain ORDER BY count DESC
    `).all();
    return rows;
  }
  // ============================================================================
  // Failures
  // ============================================================================
  getFailures(options) {
    let sql = `
      SELECT * FROM observations
      WHERE category = 'error' AND (urgency = 'high' OR urgency = 'critical')
    `;
    const params = [];
    if (options.domain) {
      sql += " AND domain = ?";
      params.push(options.domain);
    }
    if (options.since) {
      sql += " AND created_at >= ?";
      params.push(options.since);
    }
    sql += " ORDER BY created_at DESC";
    if (options.limit) {
      sql += " LIMIT ?";
      params.push(options.limit);
    }
    const rows = this.db.prepare(sql).all(...params);
    return rows.map((row) => this.rowToObservation(row));
  }
  // ============================================================================
  // Sync State
  // ============================================================================
  getSyncState(peerName) {
    const row = this.db.prepare("SELECT * FROM sync_state WHERE peer_name = ?").get(peerName);
    if (!row) return null;
    return {
      last_sync_at: row["last_sync_at"],
      last_observation_id: row["last_observation_id"],
      sync_count: row["sync_count"]
    };
  }
  updateSyncState(peerName, lastSyncAt, lastObservationId) {
    this.db.prepare(`
      INSERT INTO sync_state (peer_name, last_sync_at, last_observation_id, sync_count)
      VALUES (?, ?, ?, 1)
      ON CONFLICT(peer_name) DO UPDATE SET
        last_sync_at = excluded.last_sync_at,
        last_observation_id = excluded.last_observation_id,
        sync_count = sync_count + 1
    `).run(peerName, lastSyncAt, lastObservationId);
  }
  // ============================================================================
  // Helpers
  // ============================================================================
  rowToObservation(row) {
    return {
      id: row["id"],
      agent_hash: row["agent_hash"],
      domain: row["domain"],
      path: row["path"],
      category: row["category"],
      summary: row["summary"],
      structured_data: row["structured_data"] ? JSON.parse(row["structured_data"]) : void 0,
      impact_estimate: row["impact_estimate"] ? JSON.parse(row["impact_estimate"]) : void 0,
      impact_reports: row["impact_reports"] ? JSON.parse(row["impact_reports"]) : [],
      impact_stats: row["impact_stats"] ? JSON.parse(row["impact_stats"]) : void 0,
      status: row["status"],
      confirmations: row["confirmations"],
      confirming_agents: JSON.parse(row["confirming_agents"]),
      confidence: row["confidence"],
      urgency: row["urgency"],
      tags: JSON.parse(row["tags"]),
      content_hash: row["content_hash"],
      vector_id: row["vector_id"],
      created_at: row["created_at"],
      updated_at: row["updated_at"],
      expires_at: row["expires_at"]
    };
  }
  rowToConfirmationGroup(row) {
    return {
      id: row["id"],
      domain: row["domain"],
      path: row["path"],
      category: row["category"],
      content_hash: row["content_hash"],
      canonical_observation_id: row["canonical_observation_id"],
      total_confirmations: row["total_confirmations"],
      unique_agents: JSON.parse(row["unique_agents"]),
      status: row["status"],
      confidence: row["confidence"],
      created_at: row["created_at"],
      updated_at: row["updated_at"]
    };
  }
  close() {
    this.db.close();
  }
};
var JSONLStorage = class {
  filePath;
  constructor(filePath) {
    this.filePath = filePath;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
  /**
   * Append an observation to the log
   */
  append(observation) {
    const line = JSON.stringify(observation) + "\n";
    fs.appendFileSync(this.filePath, line, "utf8");
  }
  /**
   * Append multiple observations in a batch
   */
  appendBatch(observations) {
    const lines = observations.map((o) => JSON.stringify(o)).join("\n") + "\n";
    fs.appendFileSync(this.filePath, lines, "utf8");
  }
  /**
   * Read all observations from the log
   */
  readAll() {
    if (!fs.existsSync(this.filePath)) {
      return [];
    }
    const content = fs.readFileSync(this.filePath, "utf8");
    const lines = content.trim().split("\n").filter((line) => line.length > 0);
    return lines.map((line) => JSON.parse(line));
  }
  /**
   * Read observations since a specific ID
   * Used for incremental sync
   */
  readSince(sinceId) {
    const all = this.readAll();
    if (!sinceId) {
      return all;
    }
    const sinceIndex = all.findIndex((o) => o.id === sinceId);
    if (sinceIndex === -1) {
      return all;
    }
    return all.slice(sinceIndex + 1);
  }
  /**
   * Get the last observation in the log
   */
  getLastObservation() {
    const all = this.readAll();
    return all.length > 0 ? all[all.length - 1] : null;
  }
  /**
   * Count observations in the log
   */
  count() {
    if (!fs.existsSync(this.filePath)) {
      return 0;
    }
    const content = fs.readFileSync(this.filePath, "utf8");
    return content.trim().split("\n").filter((line) => line.length > 0).length;
  }
  /**
   * Get the file path
   */
  getPath() {
    return this.filePath;
  }
};
function getDefaultDataDir() {
  const baseDir = process.env["SUBSTRATE_DATA_DIR"] ?? process.env["XDG_DATA_HOME"] ?? path.join(os.homedir(), ".local", "share");
  return path.join(baseDir, "substrate");
}
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}
function getDataPaths(dataDir) {
  return {
    root: dataDir,
    sqlite: path.join(dataDir, "substrate.db"),
    jsonl: path.join(dataDir, "observations.jsonl"),
    outbox: path.join(dataDir, "outbox"),
    config: path.join(dataDir, "config.json"),
    logs: path.join(dataDir, "logs")
  };
}
function initializeDataDir(dataDir) {
  const paths = getDataPaths(dataDir);
  ensureDir(paths.root);
  ensureDir(paths.outbox);
  ensureDir(paths.logs);
  return paths;
}

// src/storage/index.ts
var Storage = class {
  sqlite;
  jsonl;
  constructor(config) {
    const paths = initializeDataDir(config.data_dir);
    const sqlitePath = config.sqlite_path ?? paths.sqlite;
    const jsonlPath = config.jsonl_path ?? paths.jsonl;
    this.sqlite = new SQLiteStorage(sqlitePath);
    this.jsonl = new JSONLStorage(jsonlPath);
  }
  /**
   * Insert an observation into both storage backends
   */
  insert(observation) {
    this.sqlite.insertObservation(observation);
    this.jsonl.append(observation);
  }
  /**
   * Get an observation by ID
   */
  get(id) {
    return this.sqlite.getObservation(id);
  }
  /**
   * Update an observation
   */
  update(id, updates) {
    this.sqlite.updateObservation(id, updates);
  }
  /**
   * Query observations with filters
   */
  query(options) {
    return this.sqlite.queryObservations(options);
  }
  /**
   * Count observations matching filters
   */
  count(options) {
    return this.sqlite.countObservations(options);
  }
  /**
   * Get observation statistics
   */
  getStats(domain) {
    return this.sqlite.getStats(domain);
  }
  /**
   * Get all domains with observation counts
   */
  getAllDomains() {
    return this.sqlite.getAllDomains();
  }
  /**
   * Get failure observations
   */
  getFailures(options) {
    return this.sqlite.getFailures(options);
  }
  /**
   * Add an impact report to an observation
   */
  addImpactReport(id, report) {
    return this.sqlite.addImpactReport(id, report);
  }
  /**
   * Find an existing confirmation group
   */
  findConfirmationGroup(domain, path, category, contentHash) {
    return this.sqlite.findConfirmationGroup(domain, path, category, contentHash);
  }
  /**
   * Create a new confirmation group
   */
  createConfirmationGroup(domain, path, category, contentHash, observationId, agentHash) {
    return this.sqlite.createConfirmationGroup(domain, path, category, contentHash, observationId, agentHash);
  }
  /**
   * Update a confirmation group
   */
  updateConfirmationGroup(id, updates) {
    return this.sqlite.updateConfirmationGroup(id, updates);
  }
  /**
   * Get sync state for a peer
   */
  getSyncState(peerName) {
    return this.sqlite.getSyncState(peerName);
  }
  /**
   * Update sync state for a peer
   */
  updateSyncState(peerName, lastSyncAt, lastObservationId) {
    return this.sqlite.updateSyncState(peerName, lastSyncAt, lastObservationId);
  }
  /**
   * Read observations from JSONL since a specific ID (for sync)
   */
  readJSONLSince(sinceId) {
    return this.jsonl.readSince(sinceId);
  }
  /**
   * Close storage connections
   */
  close() {
    this.sqlite.close();
  }
};

// src/vector/embeddings.ts
var embeddingPipeline = null;
var EmbeddingGenerator = class {
  config;
  initialized = false;
  constructor(config) {
    this.config = config;
  }
  /**
   * Initialize the embedding pipeline
   */
  async initialize() {
    if (this.initialized) return;
    const { pipeline } = await import('@xenova/transformers');
    embeddingPipeline = await pipeline("feature-extraction", this.config.model, {
      quantized: true
    });
    this.initialized = true;
  }
  /**
   * Generate embedding for a single text
   */
  async embed(text) {
    await this.initialize();
    if (!embeddingPipeline) {
      throw new Error("Embedding pipeline not initialized");
    }
    const output = await embeddingPipeline(text, {
      pooling: "mean",
      normalize: true
    });
    const tensor = output;
    return Array.from(tensor.data);
  }
  /**
   * Generate embeddings for multiple texts in batch
   */
  async embedBatch(texts) {
    await this.initialize();
    if (!embeddingPipeline) {
      throw new Error("Embedding pipeline not initialized");
    }
    const results = [];
    for (let i = 0; i < texts.length; i += this.config.batch_size) {
      const batch = texts.slice(i, i + this.config.batch_size);
      const batchResults = await Promise.all(batch.map((text) => this.embed(text)));
      results.push(...batchResults);
    }
    return results;
  }
  /**
   * Get the dimension of the embeddings
   */
  getDimension() {
    return this.config.dimension;
  }
  /**
   * Create searchable text from observation fields
   */
  static createSearchableText(domain, path, category, summary, structuredData) {
    const parts = [
      `domain: ${domain}`,
      path ? `path: ${path}` : "",
      `category: ${category}`,
      summary
    ];
    if (structuredData) {
      for (const [key, value] of Object.entries(structuredData)) {
        if (value !== void 0 && value !== null) {
          parts.push(`${key}: ${String(value)}`);
        }
      }
    }
    return parts.filter(Boolean).join(" | ");
  }
};
var QdrantStorage = class {
  client;
  collectionName;
  dimension;
  initialized = false;
  constructor(qdrantConfig, embeddingConfig) {
    this.client = new jsClientRest.QdrantClient({
      url: qdrantConfig.url,
      apiKey: qdrantConfig.api_key
    });
    this.collectionName = qdrantConfig.collection_name;
    this.dimension = embeddingConfig.dimension;
  }
  /**
   * Initialize the collection if it doesn't exist
   */
  async initialize() {
    if (this.initialized) return;
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === this.collectionName);
      if (!exists) {
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: this.dimension,
            distance: "Cosine"
          },
          optimizers_config: {
            default_segment_number: 2
          },
          replication_factor: 1
        });
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "domain",
          field_schema: "keyword"
        });
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "category",
          field_schema: "keyword"
        });
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "status",
          field_schema: "keyword"
        });
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: "confidence",
          field_schema: "float"
        });
      }
      this.initialized = true;
    } catch (error) {
      console.warn("Qdrant initialization failed:", error);
      throw error;
    }
  }
  /**
   * Check if Qdrant is available
   */
  async isAvailable() {
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
  async upsert(vectorId, embedding, observation) {
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
            created_at: observation.created_at
          }
        }
      ]
    });
  }
  /**
   * Batch upsert multiple vectors
   */
  async upsertBatch(items) {
    await this.initialize();
    const points = items.map((item) => ({
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
        created_at: item.observation.created_at
      }
    }));
    await this.client.upsert(this.collectionName, {
      wait: true,
      points
    });
  }
  /**
   * Search for similar vectors with optional filters
   */
  async search(queryEmbedding, limit, filters) {
    await this.initialize();
    const must = [];
    if (filters?.domain) {
      must.push({
        key: "domain",
        match: { value: filters.domain }
      });
    }
    if (filters?.category) {
      must.push({
        key: "category",
        match: { value: filters.category }
      });
    }
    if (filters?.status) {
      must.push({
        key: "status",
        match: { value: filters.status }
      });
    }
    if (filters?.min_confidence !== void 0) {
      must.push({
        key: "confidence",
        range: { gte: filters.min_confidence }
      });
    }
    const filter = must.length > 0 ? { must } : void 0;
    const results = await this.client.search(this.collectionName, {
      vector: queryEmbedding,
      limit,
      filter,
      with_payload: true
    });
    return results.map((result) => ({
      id: result.id,
      score: result.score,
      observation_id: result.payload["observation_id"]
    }));
  }
  /**
   * Delete a vector point
   */
  async delete(vectorId) {
    await this.initialize();
    await this.client.delete(this.collectionName, {
      wait: true,
      points: [vectorId]
    });
  }
  /**
   * Get collection info
   */
  async getCollectionInfo() {
    try {
      await this.initialize();
      const info = await this.client.getCollection(this.collectionName);
      return {
        points_count: info.points_count ?? 0
      };
    } catch {
      return null;
    }
  }
  /**
   * Update payload for an existing point
   */
  async updatePayload(vectorId, updates) {
    await this.initialize();
    await this.client.setPayload(this.collectionName, {
      wait: true,
      points: [vectorId],
      payload: updates
    });
  }
};
function generateObservationId() {
  return crypto.randomUUID();
}
function generateVectorId() {
  return crypto.randomUUID();
}
function generateSyncBatchId() {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomUUID().slice(0, 8);
  return `sync_${timestamp}_${random}`;
}

// src/vector/index.ts
var VectorSearch = class {
  embeddings;
  qdrant;
  initialized = false;
  available = false;
  constructor(config) {
    const embeddingConfig = config.embedding ?? {
      model: "Xenova/all-MiniLM-L6-v2",
      dimension: 384,
      batch_size: 32
    };
    const qdrantConfig = config.qdrant ?? {
      url: "http://localhost:6333",
      collection_name: "substrate_observations"
    };
    this.embeddings = new EmbeddingGenerator(embeddingConfig);
    this.qdrant = new QdrantStorage(qdrantConfig, embeddingConfig);
  }
  /**
   * Initialize vector search components
   */
  async initialize() {
    if (this.initialized) return this.available;
    try {
      this.available = await this.qdrant.isAvailable();
      if (this.available) {
        await Promise.all([
          this.embeddings.initialize(),
          this.qdrant.initialize()
        ]);
      } else {
        console.warn("Qdrant not available - vector search disabled");
      }
      this.initialized = true;
      return this.available;
    } catch (error) {
      console.warn("Vector search initialization failed:", error);
      this.initialized = true;
      this.available = false;
      return false;
    }
  }
  /**
   * Check if vector search is available
   */
  isAvailable() {
    return this.available;
  }
  /**
   * Index an observation for vector search
   * Returns the vector ID if successful
   */
  async index(observation) {
    if (!this.available) {
      await this.initialize();
      if (!this.available) return void 0;
    }
    try {
      const text = EmbeddingGenerator.createSearchableText(
        observation.domain,
        observation.path,
        observation.category,
        observation.summary,
        observation.structured_data
      );
      const embedding = await this.embeddings.embed(text);
      const vectorId = observation.vector_id ?? generateVectorId();
      await this.qdrant.upsert(vectorId, embedding, observation);
      return vectorId;
    } catch (error) {
      console.warn("Vector indexing failed:", error);
      return void 0;
    }
  }
  /**
   * Index multiple observations in batch
   */
  async indexBatch(observations) {
    const results = /* @__PURE__ */ new Map();
    if (!this.available) {
      await this.initialize();
      if (!this.available) return results;
    }
    try {
      const texts = observations.map(
        (obs) => EmbeddingGenerator.createSearchableText(
          obs.domain,
          obs.path,
          obs.category,
          obs.summary,
          obs.structured_data
        )
      );
      const embeddings = await this.embeddings.embedBatch(texts);
      const items = observations.map((obs, i) => {
        const vectorId = obs.vector_id ?? generateVectorId();
        results.set(obs.id, vectorId);
        return {
          vectorId,
          embedding: embeddings[i],
          observation: obs
        };
      });
      await this.qdrant.upsertBatch(items);
      return results;
    } catch (error) {
      console.warn("Batch vector indexing failed:", error);
      return results;
    }
  }
  /**
   * Search for similar observations
   */
  async search(query, options = {}) {
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
        min_confidence: options.min_confidence
      }
    );
    const search_time_ms = Date.now() - searchStart;
    return { results, embedding_time_ms, search_time_ms };
  }
  /**
   * Update vector payload (e.g., when observation status changes)
   */
  async updatePayload(vectorId, updates) {
    if (!this.available) return;
    try {
      await this.qdrant.updatePayload(vectorId, updates);
    } catch (error) {
      console.warn("Vector payload update failed:", error);
    }
  }
  /**
   * Delete a vector
   */
  async delete(vectorId) {
    if (!this.available) return;
    try {
      await this.qdrant.delete(vectorId);
    } catch (error) {
      console.warn("Vector deletion failed:", error);
    }
  }
  /**
   * Get vector index statistics
   */
  async getStats() {
    if (!this.available) return null;
    try {
      return await this.qdrant.getCollectionInfo();
    } catch {
      return null;
    }
  }
};

// src/confirmation/aggregator.ts
init_hash();
var Aggregator = class {
  storage;
  config;
  constructor(storage, config) {
    this.storage = storage;
    this.config = config;
  }
  /**
   * Process a new observation and aggregate it with existing similar observations
   */
  aggregate(observation) {
    const contentHash = generateContentHash(
      observation.domain,
      observation.path,
      observation.category,
      observation.structured_data
    );
    const existingGroup = this.storage.findConfirmationGroup(
      observation.domain,
      observation.path,
      observation.category,
      contentHash
    );
    if (existingGroup) {
      if (existingGroup.unique_agents.includes(observation.agent_hash)) {
        return {
          isNew: false,
          groupId: existingGroup.id,
          canonicalObservationId: existingGroup.canonical_observation_id,
          totalConfirmations: existingGroup.total_confirmations,
          uniqueAgentCount: existingGroup.unique_agents.length
        };
      }
      const newAgents = [...existingGroup.unique_agents, observation.agent_hash];
      const newConfirmations = existingGroup.total_confirmations + 1;
      this.storage.updateConfirmationGroup(existingGroup.id, {
        total_confirmations: newConfirmations,
        unique_agents: newAgents
      });
      return {
        isNew: false,
        groupId: existingGroup.id,
        canonicalObservationId: existingGroup.canonical_observation_id,
        totalConfirmations: newConfirmations,
        uniqueAgentCount: newAgents.length
      };
    }
    const newGroup = this.storage.createConfirmationGroup(
      observation.domain,
      observation.path,
      observation.category,
      contentHash,
      observation.id,
      observation.agent_hash
    );
    return {
      isNew: true,
      groupId: newGroup.id,
      canonicalObservationId: observation.id,
      totalConfirmations: 1,
      uniqueAgentCount: 1
    };
  }
  /**
   * Get the content hash for an observation
   */
  getContentHash(observation) {
    return generateContentHash(
      observation.domain,
      observation.path,
      observation.category,
      observation.structured_data
    );
  }
};

// src/confirmation/promoter.ts
var Promoter = class {
  storage;
  config;
  vectorSearch;
  constructor(storage, config, vectorSearch) {
    this.storage = storage;
    this.config = config;
    this.vectorSearch = vectorSearch ?? null;
  }
  /**
   * Calculate confidence based on confirmation count
   * confidence = min(1.0, confirmations / (threshold * 2))
   */
  calculateConfidence(confirmations) {
    return Math.min(1, confirmations / this.config.confidence_factor);
  }
  /**
   * Check and promote observation based on confirmation count
   */
  async checkAndPromote(groupId, uniqueAgentCount, canonicalObservationId) {
    const observation = this.storage.get(canonicalObservationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: "pending",
        newConfidence: 0,
        message: "Observation not found"
      };
    }
    const newConfidence = this.calculateConfidence(uniqueAgentCount);
    const shouldPromote = uniqueAgentCount >= this.config.threshold;
    let newStatus = observation.status;
    if (shouldPromote && observation.status === "pending") {
      newStatus = "confirmed";
    }
    this.storage.update(canonicalObservationId, {
      status: newStatus,
      confirmations: uniqueAgentCount,
      confidence: newConfidence
    });
    this.storage.updateConfirmationGroup(groupId, {
      status: newStatus,
      confidence: newConfidence
    });
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: newStatus,
        confidence: newConfidence
      });
    }
    const promoted = newStatus === "confirmed" && observation.status === "pending";
    return {
      promoted,
      newStatus,
      newConfidence,
      message: promoted ? `Observation promoted to confirmed (${uniqueAgentCount} unique agents)` : `Observation updated (${uniqueAgentCount}/${this.config.threshold} confirmations)`
    };
  }
  /**
   * Manually confirm an observation (admin action)
   */
  async manualConfirm(observationId, reason) {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: "pending",
        newConfidence: 0,
        message: "Observation not found"
      };
    }
    this.storage.update(observationId, {
      status: "confirmed",
      confidence: 1
    });
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: "confirmed",
        confidence: 1
      });
    }
    return {
      promoted: true,
      newStatus: "confirmed",
      newConfidence: 1,
      message: reason ? `Manually confirmed: ${reason}` : "Manually confirmed by admin"
    };
  }
  /**
   * Mark an observation as stale
   */
  async markStale(observationId, reason) {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: "pending",
        newConfidence: 0,
        message: "Observation not found"
      };
    }
    this.storage.update(observationId, {
      status: "stale"
    });
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: "stale"
      });
    }
    return {
      promoted: false,
      newStatus: "stale",
      newConfidence: observation.confidence,
      message: reason ? `Marked stale: ${reason}` : "Marked as stale"
    };
  }
  /**
   * Reject an observation (mark as contradicted)
   */
  async reject(observationId, reason) {
    const observation = this.storage.get(observationId);
    if (!observation) {
      return {
        promoted: false,
        newStatus: "pending",
        newConfidence: 0,
        message: "Observation not found"
      };
    }
    this.storage.update(observationId, {
      status: "contradicted",
      confidence: 0
    });
    if (this.vectorSearch && observation.vector_id) {
      await this.vectorSearch.updatePayload(observation.vector_id, {
        status: "contradicted",
        confidence: 0
      });
    }
    return {
      promoted: false,
      newStatus: "contradicted",
      newConfidence: 0,
      message: reason ? `Rejected: ${reason}` : "Rejected"
    };
  }
};

// src/confirmation/contradiction.ts
var ContradictionDetector = class {
  storage;
  config;
  constructor(storage, config) {
    this.storage = storage;
    this.config = config;
  }
  /**
   * Check for contradictions with existing observations
   * Looks for observations with same domain/path/category but different structured_data
   */
  detectContradictions(observation) {
    const windowStart = new Date(
      Date.now() - this.config.contradiction_window_hours * 60 * 60 * 1e3
    ).toISOString();
    const existing = this.storage.query({
      domain: observation.domain,
      path: observation.path,
      category: observation.category,
      since: windowStart,
      limit: 50
    });
    const contradictions = [];
    for (const existing_obs of existing) {
      if (existing_obs.id === observation.id) continue;
      if (existing_obs.status === "contradicted" || existing_obs.status === "stale") continue;
      if (this.dataConflicts(observation.structured_data, existing_obs.structured_data)) {
        contradictions.push(existing_obs.id);
      }
    }
    if (contradictions.length > 0) {
      return {
        hasContradiction: true,
        contradictingObservations: contradictions,
        message: `Found ${contradictions.length} potentially contradicting observation(s)`
      };
    }
    return {
      hasContradiction: false,
      contradictingObservations: [],
      message: "No contradictions detected"
    };
  }
  /**
   * Mark observations as contradicted
   */
  markAsContradicted(observationIds) {
    for (const id of observationIds) {
      this.storage.update(id, {
        status: "contradicted"
      });
    }
  }
  /**
   * Check if two structured data objects conflict
   */
  dataConflicts(data1, data2) {
    if (!data1 && !data2) return false;
    if (!data1 || !data2) return false;
    if (typeof data1 !== "object" || typeof data2 !== "object") return false;
    const obj1 = data1;
    const obj2 = data2;
    for (const key of Object.keys(obj1)) {
      if (key in obj2) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        if (val1 === void 0 || val1 === null) continue;
        if (val2 === void 0 || val2 === null) continue;
        if (JSON.stringify(val1) !== JSON.stringify(val2)) {
          return true;
        }
      }
    }
    return false;
  }
};

// src/confirmation/fuzzy-matcher.ts
var FuzzyMatcher = class {
  vectorSearch;
  similarityThreshold;
  constructor(vectorSearch, similarityThreshold = 0.85) {
    this.vectorSearch = vectorSearch;
    this.similarityThreshold = similarityThreshold;
  }
  /**
   * Find a fuzzy match for an observation
   */
  async findMatch(observation) {
    if (!this.vectorSearch.isAvailable()) {
      return {
        matched: false,
        matchedObservationId: null,
        similarity: 0
      };
    }
    const searchText = `${observation.domain} ${observation.path ?? ""} ${observation.category} ${observation.summary}`;
    const { results } = await this.vectorSearch.search(searchText, {
      domain: observation.domain,
      category: observation.category,
      limit: 5
    });
    for (const result of results) {
      if (result.observation_id === observation.id) continue;
      if (result.score >= this.similarityThreshold) {
        return {
          matched: true,
          matchedObservationId: result.observation_id,
          similarity: result.score
        };
      }
    }
    return {
      matched: false,
      matchedObservationId: null,
      similarity: results[0]?.score ?? 0
    };
  }
  /**
   * Set the similarity threshold
   */
  setThreshold(threshold) {
    this.similarityThreshold = Math.max(0, Math.min(1, threshold));
  }
  /**
   * Get the current similarity threshold
   */
  getThreshold() {
    return this.similarityThreshold;
  }
};

// src/confirmation/index.ts
var ConfirmationEngine = class {
  aggregator;
  promoter;
  contradictionDetector;
  fuzzyMatcher = null;
  config;
  constructor(storage, config, vectorSearch) {
    this.config = config;
    this.aggregator = new Aggregator(storage, config);
    this.promoter = new Promoter(storage, config, vectorSearch);
    this.contradictionDetector = new ContradictionDetector(storage, config);
    if (vectorSearch) {
      this.fuzzyMatcher = new FuzzyMatcher(vectorSearch);
    }
  }
  /**
   * Process a new observation through the confirmation pipeline
   */
  async processObservation(observation) {
    const contradiction = this.contradictionDetector.detectContradictions(observation);
    if (contradiction.hasContradiction) {
      this.contradictionDetector.markAsContradicted(contradiction.contradictingObservations);
    }
    const aggregation = this.aggregator.aggregate(observation);
    const promotion = await this.promoter.checkAndPromote(
      aggregation.groupId,
      aggregation.uniqueAgentCount,
      aggregation.canonicalObservationId
    );
    return {
      aggregation,
      promotion,
      contradiction
    };
  }
  /**
   * Manually confirm an observation (admin action)
   */
  async manualConfirm(observationId, reason) {
    return this.promoter.manualConfirm(observationId, reason);
  }
  /**
   * Manually reject an observation
   */
  async reject(observationId, reason) {
    return this.promoter.reject(observationId, reason);
  }
  /**
   * Mark an observation as stale
   */
  async markStale(observationId, reason) {
    return this.promoter.markStale(observationId, reason);
  }
  /**
   * Get content hash for an observation
   */
  getContentHash(observation) {
    return this.aggregator.getContentHash(observation);
  }
  /**
   * Get the confirmation threshold
   */
  getThreshold() {
    return this.config.threshold;
  }
  /**
   * Calculate confidence for a given confirmation count
   */
  calculateConfidence(confirmations) {
    return this.promoter.calculateConfidence(confirmations);
  }
  /**
   * v0.3: Find fuzzy matches for an observation
   */
  async findFuzzyMatch(observation) {
    if (!this.fuzzyMatcher) {
      return { matched: false, matchedId: null, similarity: 0 };
    }
    const result = await this.fuzzyMatcher.findMatch(observation);
    return {
      matched: result.matched,
      matchedId: result.matchedObservationId,
      similarity: result.similarity
    };
  }
};
var FileTransport = class {
  outboxPath;
  constructor(outboxPath) {
    this.outboxPath = outboxPath;
    this.ensureDir(outboxPath);
  }
  /**
   * Write observations to outbox for other peers to pick up
   */
  writeToOutbox(observations) {
    if (observations.length === 0) return "";
    const batch = {
      id: generateSyncBatchId(),
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      observations
    };
    const filename = `${batch.id}.json`;
    const filepath = path.join(this.outboxPath, filename);
    fs.writeFileSync(filepath, JSON.stringify(batch, null, 2), "utf8");
    return batch.id;
  }
  /**
   * Read sync batches from a peer's outbox
   */
  readFromPeerOutbox(peerOutboxPath, afterBatchId) {
    if (!fs.existsSync(peerOutboxPath)) {
      return [];
    }
    const files = fs.readdirSync(peerOutboxPath).filter((f) => f.endsWith(".json")).sort();
    const batches = [];
    let foundAfterBatch = !afterBatchId;
    for (const file of files) {
      const batchId = path.basename(file, ".json");
      if (!foundAfterBatch) {
        if (batchId === afterBatchId) {
          foundAfterBatch = true;
        }
        continue;
      }
      try {
        const content = fs.readFileSync(path.join(peerOutboxPath, file), "utf8");
        const batch = JSON.parse(content);
        batches.push(batch);
      } catch (error) {
        console.warn(`Failed to read sync batch ${file}:`, error);
      }
    }
    return batches;
  }
  /**
   * Get the latest batch ID from outbox
   */
  getLatestBatchId() {
    if (!fs.existsSync(this.outboxPath)) {
      return null;
    }
    const files = fs.readdirSync(this.outboxPath).filter((f) => f.endsWith(".json")).sort();
    if (files.length === 0) return null;
    return path.basename(files[files.length - 1], ".json");
  }
  /**
   * Clean up old batches from outbox
   */
  cleanupOldBatches(maxAgeMs = 7 * 24 * 60 * 60 * 1e3) {
    if (!fs.existsSync(this.outboxPath)) {
      return 0;
    }
    const files = fs.readdirSync(this.outboxPath).filter((f) => f.endsWith(".json"));
    const now = Date.now();
    let cleaned = 0;
    for (const file of files) {
      try {
        const filepath = path.join(this.outboxPath, file);
        const content = fs.readFileSync(filepath, "utf8");
        const batch = JSON.parse(content);
        const createdAt = new Date(batch.created_at).getTime();
        if (now - createdAt > maxAgeMs) {
          fs.unlinkSync(filepath);
          cleaned++;
        }
      } catch (error) {
        console.warn(`Failed to check/clean batch ${file}:`, error);
      }
    }
    return cleaned;
  }
  /**
   * Get outbox path
   */
  getOutboxPath() {
    return this.outboxPath;
  }
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
};

// src/sync/urgent.ts
var UrgentSignalHandler = class {
  transport;
  pendingUrgent = [];
  flushTimer = null;
  urgentIntervalMs;
  constructor(transport, urgentIntervalMs = 5e3) {
    this.transport = transport;
    this.urgentIntervalMs = urgentIntervalMs;
  }
  /**
   * Check if an observation is urgent
   */
  isUrgent(observation) {
    if (observation.urgency === "critical") return true;
    if (observation.urgency === "high" && observation.category === "error") return true;
    if (observation.category === "auth" && observation.structured_data) {
      const data = observation.structured_data;
      if (data["error"] || data["failed"]) return true;
    }
    return false;
  }
  /**
   * Queue an urgent observation for fast sync
   */
  queue(observation) {
    this.pendingUrgent.push(observation);
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), this.urgentIntervalMs);
    }
  }
  /**
   * Flush urgent observations immediately
   */
  flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.pendingUrgent.length === 0) {
      return null;
    }
    const observations = this.pendingUrgent;
    this.pendingUrgent = [];
    return this.transport.writeToOutbox(observations);
  }
  /**
   * Get count of pending urgent observations
   */
  getPendingCount() {
    return this.pendingUrgent.length;
  }
  /**
   * Stop the urgent handler
   */
  stop() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.pendingUrgent = [];
  }
};

// src/sync/index.ts
var SyncCoordinator = class {
  storage;
  transport;
  urgentHandler;
  confirmationEngine;
  vectorSearch;
  config;
  syncTimer = null;
  running = false;
  constructor(storage, config, confirmationEngine, vectorSearch) {
    this.storage = storage;
    this.config = config;
    this.transport = new FileTransport(config.outbox_path);
    this.urgentHandler = new UrgentSignalHandler(this.transport, config.urgent_interval_ms);
    this.confirmationEngine = confirmationEngine ?? null;
    this.vectorSearch = vectorSearch ?? null;
  }
  /**
   * Start the sync coordinator
   */
  start() {
    if (this.running || !this.config.enabled) return;
    this.running = true;
    this.scheduleSyncCycle();
  }
  /**
   * Stop the sync coordinator
   */
  stop() {
    this.running = false;
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    this.urgentHandler.stop();
  }
  /**
   * Export an observation for sync
   */
  exportObservation(observation) {
    if (!this.config.enabled) return;
    if (this.urgentHandler.isUrgent(observation)) {
      this.urgentHandler.queue(observation);
    }
  }
  /**
   * Flush urgent observations immediately
   */
  flushUrgent() {
    return this.urgentHandler.flush();
  }
  /**
   * Run a sync cycle with all peers
   */
  async syncWithPeers() {
    const results = [];
    for (const peer of this.config.peers) {
      if (!peer.enabled) continue;
      try {
        const result = await this.syncWithPeer(peer);
        results.push(result);
      } catch (error) {
        console.warn(`Sync with peer ${peer.name} failed:`, error);
        results.push({
          peer: peer.name,
          batchesProcessed: 0,
          observationsImported: 0,
          lastBatchId: null
        });
      }
    }
    return results;
  }
  /**
   * Sync with a specific peer
   */
  async syncWithPeer(peer) {
    const syncState = this.storage.getSyncState(peer.name);
    const lastBatchId = syncState?.last_observation_id ?? null;
    const batches = this.transport.readFromPeerOutbox(peer.path, lastBatchId ?? void 0);
    let observationsImported = 0;
    let lastProcessedBatchId = null;
    for (const batch of batches) {
      const imported = await this.importBatch(batch);
      observationsImported += imported;
      lastProcessedBatchId = batch.id;
    }
    if (lastProcessedBatchId) {
      this.storage.updateSyncState(peer.name, (/* @__PURE__ */ new Date()).toISOString(), lastProcessedBatchId);
    }
    return {
      peer: peer.name,
      batchesProcessed: batches.length,
      observationsImported,
      lastBatchId: lastProcessedBatchId
    };
  }
  /**
   * Import a sync batch
   */
  async importBatch(batch) {
    let imported = 0;
    for (const observation of batch.observations) {
      try {
        const existing = this.storage.get(observation.id);
        if (existing) continue;
        this.storage.insert(observation);
        if (this.vectorSearch) {
          const vectorId = await this.vectorSearch.index(observation);
          if (vectorId) {
            this.storage.update(observation.id, { vector_id: vectorId });
          }
        }
        if (this.confirmationEngine) {
          await this.confirmationEngine.processObservation(observation);
        }
        imported++;
      } catch (error) {
        console.warn(`Failed to import observation ${observation.id}:`, error);
      }
    }
    return imported;
  }
  /**
   * Export pending observations to outbox
   */
  exportPendingObservations() {
    const lastBatchId = this.transport.getLatestBatchId();
    const observations = this.storage.readJSONLSince(lastBatchId);
    if (observations.length === 0) return null;
    return this.transport.writeToOutbox(observations);
  }
  /**
   * Schedule the next sync cycle
   */
  scheduleSyncCycle() {
    if (!this.running) return;
    this.syncTimer = setTimeout(async () => {
      try {
        this.exportPendingObservations();
        await this.syncWithPeers();
        this.transport.cleanupOldBatches();
      } catch (error) {
        console.warn("Sync cycle failed:", error);
      }
      this.scheduleSyncCycle();
    }, this.config.interval_ms);
  }
  /**
   * Get the outbox path
   */
  getOutboxPath() {
    return this.transport.getOutboxPath();
  }
  /**
   * Check if sync is running
   */
  isRunning() {
    return this.running;
  }
  /**
   * Get peer configurations
   */
  getPeers() {
    return this.config.peers;
  }
};
var PeerConfig = zod.z.object({
  name: zod.z.string(),
  path: zod.z.string(),
  // Path to peer's outbox directory
  enabled: zod.z.boolean().default(true)
});
var QdrantConfig = zod.z.object({
  url: zod.z.string().url().default("http://localhost:6333"),
  collection_name: zod.z.string().default("substrate_observations"),
  api_key: zod.z.string().optional()
});
var ConfirmationConfig = zod.z.object({
  threshold: zod.z.number().min(1).default(3),
  // N confirmations needed
  confidence_factor: zod.z.number().min(1).default(6),
  // Divisor for confidence calculation
  contradiction_window_hours: zod.z.number().default(24),
  // Window for contradiction detection
  stale_after_days: zod.z.number().default(30)
  // Mark as stale after N days
});
var SyncConfig = zod.z.object({
  enabled: zod.z.boolean().default(true),
  interval_ms: zod.z.number().default(6e4),
  // 1 minute default
  urgent_interval_ms: zod.z.number().default(5e3),
  // 5 seconds for urgent
  outbox_path: zod.z.string(),
  peers: zod.z.array(PeerConfig).default([])
});
var EmbeddingConfig = zod.z.object({
  model: zod.z.string().default("Xenova/all-MiniLM-L6-v2"),
  dimension: zod.z.number().default(384),
  batch_size: zod.z.number().default(32)
});
var SubstrateConfig = zod.z.object({
  // Data paths
  data_dir: zod.z.string(),
  sqlite_path: zod.z.string().optional(),
  jsonl_path: zod.z.string().optional(),
  // Agent identity
  agent_id: zod.z.string().optional(),
  // Will be hashed for privacy
  // Feature configurations
  qdrant: QdrantConfig.optional(),
  confirmation: ConfirmationConfig.optional(),
  sync: SyncConfig.optional(),
  embedding: EmbeddingConfig.optional(),
  // Logging
  log_level: zod.z.enum(["debug", "info", "warn", "error"]).default("info")
});
function createDefaultConfig(dataDir) {
  return {
    data_dir: dataDir,
    sqlite_path: `${dataDir}/substrate.db`,
    jsonl_path: `${dataDir}/observations.jsonl`,
    qdrant: {
      url: "http://localhost:6333",
      collection_name: "substrate_observations"
    },
    confirmation: {
      threshold: 3,
      confidence_factor: 6,
      contradiction_window_hours: 24,
      stale_after_days: 30
    },
    sync: {
      enabled: true,
      interval_ms: 6e4,
      urgent_interval_ms: 5e3,
      outbox_path: `${dataDir}/outbox`,
      peers: []
    },
    embedding: {
      model: "Xenova/all-MiniLM-L6-v2",
      dimension: 384,
      batch_size: 32
    },
    log_level: "info"
  };
}
function configFromEnv(baseConfig) {
  const env = process.env;
  return {
    ...baseConfig,
    data_dir: env["SUBSTRATE_DATA_DIR"] ?? baseConfig.data_dir,
    agent_id: env["SUBSTRATE_AGENT_ID"] ?? baseConfig.agent_id,
    log_level: env["SUBSTRATE_LOG_LEVEL"] ?? baseConfig.log_level,
    qdrant: {
      ...baseConfig.qdrant,
      url: env["SUBSTRATE_QDRANT_URL"] ?? baseConfig.qdrant?.url ?? "http://localhost:6333",
      collection_name: env["SUBSTRATE_QDRANT_COLLECTION"] ?? baseConfig.qdrant?.collection_name ?? "substrate_observations",
      api_key: env["SUBSTRATE_QDRANT_API_KEY"] ?? baseConfig.qdrant?.api_key
    }
  };
}

// src/types/index.ts
var createConsoleLogger = (level = "info") => {
  const levels = ["debug", "info", "warn", "error"];
  const minLevel = levels.indexOf(level);
  const shouldLog = (logLevel) => levels.indexOf(logLevel) >= minLevel;
  return {
    debug: (message, ...args) => shouldLog("debug") && console.debug(`[DEBUG] ${message}`, ...args),
    info: (message, ...args) => shouldLog("info") && console.info(`[INFO] ${message}`, ...args),
    warn: (message, ...args) => shouldLog("warn") && console.warn(`[WARN] ${message}`, ...args),
    error: (message, ...args) => shouldLog("error") && console.error(`[ERROR] ${message}`, ...args)
  };
};
var ObservationCategory = zod.z.enum([
  "behavior",
  // UI/UX patterns, workflows, interactions
  "error",
  // Error messages, failure modes
  "auth",
  // Authentication requirements, session handling
  "rate_limit",
  // Rate limiting, throttling, quotas
  "format"
  // Data formats, validation rules, encoding
]);
var ObservationStatus = zod.z.enum([
  "pending",
  // Initial state, awaiting confirmations
  "confirmed",
  // Met confirmation threshold
  "contradicted",
  // Conflicting observations detected
  "stale"
  // Marked as outdated
]);
var UrgencyLevel = zod.z.enum([
  "normal",
  // Standard sync interval
  "high",
  // Priority sync
  "critical"
  // Immediate sync (failures, auth changes)
]);
var BehaviorData = zod.z.object({
  element: zod.z.string().optional(),
  action: zod.z.string().optional(),
  expected_result: zod.z.string().optional(),
  actual_result: zod.z.string().optional(),
  workaround: zod.z.string().optional()
});
var ErrorData = zod.z.object({
  error_code: zod.z.string().optional(),
  error_message: zod.z.string().optional(),
  trigger: zod.z.string().optional(),
  resolution: zod.z.string().optional(),
  recoverable: zod.z.boolean().optional()
});
var AuthData = zod.z.object({
  method: zod.z.string().optional(),
  // oauth, api_key, session, etc.
  header: zod.z.string().optional(),
  // X-Api-Key, Authorization, etc.
  token_location: zod.z.string().optional(),
  // header, cookie, query
  session_duration: zod.z.string().optional(),
  refresh_mechanism: zod.z.string().optional()
});
var RateLimitData = zod.z.object({
  limit: zod.z.number().optional(),
  window: zod.z.string().optional(),
  // "1m", "1h", "1d"
  header_remaining: zod.z.string().optional(),
  header_reset: zod.z.string().optional(),
  retry_after: zod.z.string().optional()
});
var FormatData = zod.z.object({
  field: zod.z.string().optional(),
  format: zod.z.string().optional(),
  // "DD/MM/YYYY", "ISO8601", etc.
  validation_regex: zod.z.string().optional(),
  encoding: zod.z.string().optional(),
  max_length: zod.z.number().optional(),
  required: zod.z.boolean().optional()
});
var StructuredData = zod.z.union([
  BehaviorData.passthrough(),
  ErrorData.passthrough(),
  AuthData.passthrough(),
  RateLimitData.passthrough(),
  FormatData.passthrough(),
  zod.z.record(zod.z.unknown())
  // Allow arbitrary data for flexibility
]);
var ImpactEstimate = zod.z.object({
  time_saved_seconds: zod.z.number().min(0).optional(),
  // Estimated seconds saved
  success_rate_improvement: zod.z.number().min(0).max(100).optional(),
  // % improvement (0-100)
  reasoning: zod.z.string().optional()
  // Why this estimate
});
var ImpactReport = zod.z.object({
  agent_hash: zod.z.string(),
  actual_time_saved_seconds: zod.z.number().optional(),
  task_succeeded: zod.z.boolean().optional(),
  helpful: zod.z.boolean(),
  // Was this advice helpful?
  feedback: zod.z.string().optional(),
  // Optional feedback
  reported_at: zod.z.string().datetime()
});
var ImpactStats = zod.z.object({
  total_uses: zod.z.number().default(0),
  // Times this advice was used
  helpful_count: zod.z.number().default(0),
  // Times marked helpful
  avg_time_saved_seconds: zod.z.number().optional(),
  // Average actual time saved
  success_rate: zod.z.number().min(0).max(100).optional()
  // Actual success rate when used
});
var Observation = zod.z.object({
  // Identity
  id: zod.z.string(),
  // UUID v4
  agent_hash: zod.z.string(),
  // SHA-256 hash of agent identifier
  // Location
  domain: zod.z.string(),
  // e.g., "api.example.com"
  path: zod.z.string().optional(),
  // e.g., "/v2/users"
  // Content
  category: ObservationCategory,
  summary: zod.z.string(),
  // Human-readable summary
  structured_data: StructuredData.optional(),
  // Impact metrics
  impact_estimate: ImpactEstimate.optional(),
  // Observer's estimate
  impact_reports: zod.z.array(ImpactReport).default([]),
  // Reports from users
  impact_stats: ImpactStats.optional(),
  // Aggregated statistics
  // Confirmation tracking
  status: ObservationStatus.default("pending"),
  confirmations: zod.z.number().default(1),
  confirming_agents: zod.z.array(zod.z.string()).default([]),
  // Agent hashes that confirmed
  confidence: zod.z.number().min(0).max(1).default(0),
  // Metadata
  urgency: UrgencyLevel.default("normal"),
  tags: zod.z.array(zod.z.string()).default([]),
  // Timestamps
  created_at: zod.z.string().datetime(),
  updated_at: zod.z.string().datetime(),
  expires_at: zod.z.string().datetime().optional()
});
var CreateObservation = zod.z.object({
  domain: zod.z.string().min(1),
  path: zod.z.string().optional(),
  category: ObservationCategory,
  summary: zod.z.string().min(1).max(2e3),
  structured_data: StructuredData.optional(),
  impact_estimate: ImpactEstimate.optional(),
  urgency: UrgencyLevel.optional(),
  tags: zod.z.array(zod.z.string()).optional(),
  expires_at: zod.z.string().datetime().optional()
});
var StoredObservation = Observation.extend({
  vector_id: zod.z.string().optional(),
  // Qdrant point ID
  content_hash: zod.z.string()
  // SHA-256 of canonical content for deduplication
});
var AggregationKey = zod.z.object({
  domain: zod.z.string(),
  path: zod.z.string().optional(),
  category: ObservationCategory,
  content_hash: zod.z.string()
});

// src/schemas/tools.ts
var ObserveInput = zod.z.object({
  domain: zod.z.string().min(1).describe('The domain being observed (e.g., "api.example.com")'),
  path: zod.z.string().optional().describe('The specific path or endpoint (e.g., "/v2/checkout")'),
  category: ObservationCategory.describe("Category of observation"),
  summary: zod.z.string().min(1).max(2e3).describe("Human-readable description of the observation"),
  structured_data: zod.z.record(zod.z.unknown()).optional().describe("Structured data relevant to the category"),
  impact_estimate: zod.z.object({
    time_saved_seconds: zod.z.number().min(0).optional().describe("Estimated seconds this advice will save future agents"),
    success_rate_improvement: zod.z.number().min(0).max(100).optional().describe("Estimated % improvement in task success rate (0-100)"),
    reasoning: zod.z.string().optional().describe("Brief explanation of the estimate")
  }).optional().describe("Estimated impact of this advice for future agents"),
  urgency: UrgencyLevel.optional().describe("Urgency level for sync prioritization"),
  tags: zod.z.array(zod.z.string()).optional().describe("Tags for filtering and organization")
});
var ObserveOutput = zod.z.object({
  success: zod.z.boolean(),
  observation_id: zod.z.string().optional(),
  message: zod.z.string(),
  matched_existing: zod.z.boolean().optional(),
  new_confirmation_count: zod.z.number().optional()
});
var LookupInput = zod.z.object({
  domain: zod.z.string().min(1).describe("Domain to look up"),
  path: zod.z.string().optional().describe("Specific path to filter by"),
  category: ObservationCategory.optional().describe("Filter by category"),
  status: ObservationStatus.optional().describe("Filter by confirmation status"),
  limit: zod.z.number().min(1).max(100).default(20).describe("Maximum results to return")
});
var LookupOutput = zod.z.object({
  observations: zod.z.array(Observation),
  total_count: zod.z.number(),
  has_more: zod.z.boolean()
});
var SearchInput = zod.z.object({
  query: zod.z.string().min(1).describe("Natural language query for semantic search"),
  domain: zod.z.string().optional().describe("Filter results to specific domain"),
  category: ObservationCategory.optional().describe("Filter by category"),
  status: ObservationStatus.optional().describe("Filter by confirmation status"),
  min_confidence: zod.z.number().min(0).max(1).optional().describe("Minimum confidence threshold"),
  limit: zod.z.number().min(1).max(50).default(10).describe("Maximum results to return")
});
var SearchResult = Observation.extend({
  score: zod.z.number().min(0).max(1).describe("Semantic similarity score")
});
var SearchOutput = zod.z.object({
  results: zod.z.array(SearchResult),
  query_embedding_time_ms: zod.z.number().optional(),
  search_time_ms: zod.z.number().optional()
});
var FailuresInput = zod.z.object({
  domain: zod.z.string().optional().describe("Filter to specific domain"),
  since: zod.z.string().datetime().optional().describe("Filter to failures after this timestamp"),
  limit: zod.z.number().min(1).max(100).default(20).describe("Maximum results to return")
});
var FailuresOutput = zod.z.object({
  failures: zod.z.array(Observation),
  total_count: zod.z.number()
});
var ConfirmInput = zod.z.object({
  observation_id: zod.z.string().describe("ID of observation to confirm"),
  action: zod.z.enum(["confirm", "reject", "mark_stale"]).describe("Confirmation action"),
  reason: zod.z.string().optional().describe("Reason for the action")
});
var ConfirmOutput = zod.z.object({
  success: zod.z.boolean(),
  observation_id: zod.z.string(),
  new_status: ObservationStatus,
  new_confidence: zod.z.number(),
  message: zod.z.string()
});
var StatsInput = zod.z.object({
  domain: zod.z.string().optional().describe("Get stats for specific domain")
});
var StatsOutput = zod.z.object({
  total_observations: zod.z.number(),
  observations_by_status: zod.z.record(zod.z.number()),
  observations_by_category: zod.z.record(zod.z.number()),
  domains_count: zod.z.number(),
  top_domains: zod.z.array(zod.z.object({
    domain: zod.z.string(),
    count: zod.z.number()
  })),
  confirmations: zod.z.object({
    pending: zod.z.number(),
    confirmed: zod.z.number(),
    contradicted: zod.z.number(),
    stale: zod.z.number()
  }),
  vector_index_size: zod.z.number().optional(),
  last_sync: zod.z.string().datetime().optional()
});
var SemanticSearchInput = SearchInput;
var SemanticSearchOutput = SearchOutput;
var ReportImpactInput = zod.z.object({
  observation_id: zod.z.string().describe("ID of the observation whose advice was used"),
  helpful: zod.z.boolean().describe("Was this advice helpful for completing the task?"),
  task_succeeded: zod.z.boolean().optional().describe("Did the task succeed using this advice?"),
  actual_time_saved_seconds: zod.z.number().min(0).optional().describe("Actual time saved in seconds"),
  feedback: zod.z.string().max(500).optional().describe("Optional feedback about the advice")
});
var ReportImpactOutput = zod.z.object({
  success: zod.z.boolean(),
  observation_id: zod.z.string(),
  message: zod.z.string(),
  updated_stats: zod.z.object({
    total_uses: zod.z.number(),
    helpful_rate: zod.z.number(),
    avg_time_saved_seconds: zod.z.number().optional(),
    success_rate: zod.z.number().optional()
  }).optional()
});

// src/tools/observe.ts
init_hash();
function registerObserveTool(server, context) {
  server.tool(
    "substrate_observe",
    "Record an observation about an interface, API, or webpage for future agents. Include impact estimates to help prioritize valuable advice.",
    {
      domain: zod.z.string().describe('The domain being observed (e.g., "api.example.com")'),
      path: zod.z.string().optional().describe('The specific path or endpoint (e.g., "/v2/checkout")'),
      category: zod.z.enum(["behavior", "error", "auth", "rate_limit", "format"]).describe("Category of observation"),
      summary: zod.z.string().describe("Human-readable description of the observation"),
      structured_data: zod.z.record(zod.z.unknown()).optional().describe("Structured data relevant to the category"),
      impact_estimate: zod.z.object({
        time_saved_seconds: zod.z.number().min(0).optional().describe("Estimated seconds this advice saves (e.g., 300 = 5 minutes)"),
        success_rate_improvement: zod.z.number().min(0).max(100).optional().describe("Estimated % improvement in task success (e.g., 25 = 25% more likely to succeed)"),
        reasoning: zod.z.string().optional().describe("Brief explanation of the estimate")
      }).optional().describe("Estimated impact of this advice for future agents"),
      urgency: zod.z.enum(["normal", "high", "critical"]).optional().describe("Urgency level for sync prioritization"),
      tags: zod.z.array(zod.z.string()).optional().describe("Tags for filtering and organization")
    },
    async (args) => {
      try {
        const input = ObserveInput.parse(args);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const contentHash = generateContentHash(
          input.domain,
          input.path,
          input.category,
          input.structured_data
        );
        const existing = context.storage.query({
          domain: input.domain,
          path: input.path,
          category: input.category,
          limit: 1
        }).find((obs) => obs.content_hash === contentHash);
        if (existing) {
          const result2 = await context.confirmationEngine.processObservation(existing);
          const output2 = {
            success: true,
            observation_id: existing.id,
            message: result2.promotion.message,
            matched_existing: true,
            new_confirmation_count: result2.aggregation.totalConfirmations
          };
          return {
            content: [{ type: "text", text: JSON.stringify(output2, null, 2) }]
          };
        }
        const observation = {
          id: generateObservationId(),
          agent_hash: context.agentHash,
          domain: input.domain,
          path: input.path,
          category: input.category,
          summary: input.summary,
          structured_data: input.structured_data,
          impact_estimate: input.impact_estimate,
          impact_reports: [],
          status: "pending",
          confirmations: 1,
          confirming_agents: [context.agentHash],
          confidence: 0,
          urgency: input.urgency ?? "normal",
          tags: input.tags ?? [],
          content_hash: contentHash,
          created_at: now,
          updated_at: now
        };
        context.storage.insert(observation);
        const vectorId = await context.vectorSearch.index(observation);
        if (vectorId) {
          context.storage.update(observation.id, { vector_id: vectorId });
          observation.vector_id = vectorId;
        }
        const result = await context.confirmationEngine.processObservation(observation);
        context.syncCoordinator.exportObservation(observation);
        const output = {
          success: true,
          observation_id: observation.id,
          message: `Observation recorded. ${result.promotion.message}`,
          matched_existing: false,
          new_confirmation_count: result.aggregation.totalConfirmations
        };
        context.logger.info(`Observed: ${input.domain}${input.path ?? ""} [${input.category}]`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Observe failed:", message);
        const output = {
          success: false,
          message: `Failed to record observation: ${message}`
        };
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      }
    }
  );
}
function registerLookupTool(server, context) {
  server.tool(
    "substrate_lookup",
    "Look up observations by exact domain and optional path match",
    {
      domain: zod.z.string().describe("Domain to look up"),
      path: zod.z.string().optional().describe("Specific path to filter by"),
      category: zod.z.enum(["behavior", "error", "auth", "rate_limit", "format"]).optional().describe("Filter by category"),
      status: zod.z.enum(["pending", "confirmed", "contradicted", "stale"]).optional().describe("Filter by confirmation status"),
      limit: zod.z.number().min(1).max(100).default(20).describe("Maximum results to return")
    },
    async (args) => {
      try {
        const { domain, path, category, status, limit } = args;
        const observations = context.storage.query({
          domain,
          path,
          category,
          status,
          limit: limit + 1
          // Fetch one extra to check if there's more
        });
        const hasMore = observations.length > limit;
        const results = hasMore ? observations.slice(0, limit) : observations;
        const output = {
          observations: results,
          total_count: context.storage.count({ domain, path, category, status }),
          has_more: hasMore
        };
        context.logger.debug(`Lookup: ${domain}${path ?? ""} returned ${results.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Lookup failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerSearchTool(server, context) {
  server.tool(
    "substrate_search",
    "Semantic search for observations using natural language queries. This is the primary search method.",
    {
      query: zod.z.string().describe("Natural language query for semantic search"),
      domain: zod.z.string().optional().describe("Filter results to specific domain"),
      category: zod.z.enum(["behavior", "error", "auth", "rate_limit", "format"]).optional().describe("Filter by category"),
      status: zod.z.enum(["pending", "confirmed", "contradicted", "stale"]).optional().describe("Filter by confirmation status"),
      min_confidence: zod.z.number().min(0).max(1).optional().describe("Minimum confidence threshold"),
      limit: zod.z.number().min(1).max(50).default(10).describe("Maximum results to return")
    },
    async (args) => {
      try {
        const { query, domain, category, status, min_confidence, limit } = args;
        if (!context.vectorSearch.isAvailable()) {
          context.logger.warn("Vector search not available, falling back to SQLite query");
          const observations = context.storage.query({
            domain,
            category,
            status,
            limit
          });
          const filtered = observations.filter((obs) => {
            if (min_confidence !== void 0 && obs.confidence < min_confidence) {
              return false;
            }
            const searchText = `${obs.domain} ${obs.path ?? ""} ${obs.summary}`.toLowerCase();
            return query.toLowerCase().split(" ").some((word) => searchText.includes(word));
          });
          const results2 = filtered.map((obs) => ({
            ...obs,
            score: 0.5
            // Placeholder score for fallback
          }));
          const output2 = {
            results: results2,
            query_embedding_time_ms: 0,
            search_time_ms: 0
          };
          return {
            content: [{ type: "text", text: JSON.stringify(output2, null, 2) }]
          };
        }
        const { results: vectorResults, embedding_time_ms, search_time_ms } = await context.vectorSearch.search(
          query,
          {
            domain,
            category,
            status,
            min_confidence,
            limit
          }
        );
        const results = [];
        for (const result of vectorResults) {
          const observation = context.storage.get(result.observation_id);
          if (observation) {
            results.push({
              ...observation,
              score: result.score
            });
          }
        }
        const output = {
          results,
          query_embedding_time_ms: embedding_time_ms,
          search_time_ms
        };
        context.logger.debug(`Search: "${query}" returned ${results.length} results in ${embedding_time_ms + search_time_ms}ms`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Search failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerFailuresTool(server, context) {
  server.tool(
    "substrate_failures",
    "List recent failure signals (high/critical urgency errors)",
    {
      domain: zod.z.string().optional().describe("Filter to specific domain"),
      since: zod.z.string().optional().describe("Filter to failures after this ISO timestamp"),
      limit: zod.z.number().min(1).max(100).default(20).describe("Maximum results to return")
    },
    async (args) => {
      try {
        const { domain, since, limit } = args;
        const failures = context.storage.getFailures({
          domain,
          since,
          limit
        });
        const output = {
          failures,
          total_count: failures.length
        };
        context.logger.debug(`Failures: returned ${failures.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Failures lookup failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerConfirmTool(server, context) {
  server.tool(
    "substrate_confirm",
    "Manually confirm, reject, or mark an observation as stale (admin action)",
    {
      observation_id: zod.z.string().describe("ID of observation to act on"),
      action: zod.z.enum(["confirm", "reject", "mark_stale"]).describe("Confirmation action"),
      reason: zod.z.string().optional().describe("Reason for the action")
    },
    async (args) => {
      try {
        const { observation_id, action, reason } = args;
        let result;
        switch (action) {
          case "confirm":
            result = await context.confirmationEngine.manualConfirm(observation_id, reason);
            break;
          case "reject":
            result = await context.confirmationEngine.reject(observation_id, reason);
            break;
          case "mark_stale":
            result = await context.confirmationEngine.markStale(observation_id, reason);
            break;
        }
        const output = {
          success: result.newStatus !== "pending" || action === "mark_stale",
          observation_id,
          new_status: result.newStatus,
          new_confidence: result.newConfidence,
          message: result.message
        };
        context.logger.info(`Confirm: ${action} on ${observation_id} - ${result.message}`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Confirm action failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerStatsTool(server, context) {
  server.tool(
    "substrate_stats",
    "Get database statistics and overview",
    {
      domain: zod.z.string().optional().describe("Get stats for specific domain")
    },
    async (args) => {
      try {
        const { domain } = args;
        const stats = context.storage.getStats(domain);
        const vectorStats = await context.vectorSearch.getStats();
        const output = {
          total_observations: stats.total_observations,
          observations_by_status: stats.observations_by_status,
          observations_by_category: stats.observations_by_category,
          domains_count: stats.domains_count,
          top_domains: stats.top_domains,
          confirmations: {
            pending: stats.observations_by_status["pending"] ?? 0,
            confirmed: stats.observations_by_status["confirmed"] ?? 0,
            contradicted: stats.observations_by_status["contradicted"] ?? 0,
            stale: stats.observations_by_status["stale"] ?? 0
          },
          vector_index_size: vectorStats?.points_count
        };
        context.logger.debug(`Stats: ${stats.total_observations} total observations`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Stats failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerSemanticSearchTool(server, context) {
  server.tool(
    "substrate_semantic_search",
    "Explicit semantic search alias - searches observations using vector similarity",
    {
      query: zod.z.string().describe("Natural language query for semantic search"),
      domain: zod.z.string().optional().describe("Filter results to specific domain"),
      category: zod.z.enum(["behavior", "error", "auth", "rate_limit", "format"]).optional().describe("Filter by category"),
      status: zod.z.enum(["pending", "confirmed", "contradicted", "stale"]).optional().describe("Filter by confirmation status"),
      min_confidence: zod.z.number().min(0).max(1).optional().describe("Minimum confidence threshold"),
      limit: zod.z.number().min(1).max(50).default(10).describe("Maximum results to return")
    },
    async (args) => {
      try {
        const { query, domain, category, status, min_confidence, limit } = args;
        if (!context.vectorSearch.isAvailable()) {
          return {
            content: [{
              type: "text",
              text: JSON.stringify({
                error: "Semantic search requires Qdrant. Please start Qdrant: docker run -p 6333:6333 qdrant/qdrant",
                fallback_hint: "Use substrate_lookup for exact domain/path matching instead"
              }, null, 2)
            }]
          };
        }
        const { results: vectorResults, embedding_time_ms, search_time_ms } = await context.vectorSearch.search(
          query,
          {
            domain,
            category,
            status,
            min_confidence,
            limit
          }
        );
        const results = [];
        for (const result of vectorResults) {
          const observation = context.storage.get(result.observation_id);
          if (observation) {
            results.push({
              ...observation,
              score: result.score
            });
          }
        }
        const output = {
          results,
          query_embedding_time_ms: embedding_time_ms,
          search_time_ms
        };
        context.logger.debug(`Semantic search: "${query}" returned ${results.length} results`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Semantic search failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}
function registerReportImpactTool(server, context) {
  server.tool(
    "substrate_report_impact",
    "Report the actual impact after using advice from an observation. Helps improve advice quality by tracking what works.",
    {
      observation_id: zod.z.string().describe("ID of the observation whose advice was used"),
      helpful: zod.z.boolean().describe("Was this advice helpful for completing the task?"),
      task_succeeded: zod.z.boolean().optional().describe("Did the task succeed using this advice?"),
      actual_time_saved_seconds: zod.z.number().min(0).optional().describe("Actual time saved in seconds"),
      feedback: zod.z.string().max(500).optional().describe("Optional feedback about the advice")
    },
    async (args) => {
      try {
        const { observation_id, helpful, task_succeeded, actual_time_saved_seconds, feedback } = args;
        const result = context.storage.addImpactReport(observation_id, {
          agent_hash: context.agentHash,
          helpful,
          task_succeeded,
          actual_time_saved_seconds,
          feedback
        });
        if (!result.success) {
          const output2 = {
            success: false,
            observation_id,
            message: "Observation not found"
          };
          return {
            content: [{ type: "text", text: JSON.stringify(output2, null, 2) }]
          };
        }
        const stats = result.updated_stats;
        const output = {
          success: true,
          observation_id,
          message: `Impact reported. ${helpful ? "Marked as helpful." : "Marked as not helpful."} Total uses: ${stats?.total_uses ?? 0}`,
          updated_stats: stats ? {
            total_uses: stats.total_uses,
            helpful_rate: stats.helpful_count / stats.total_uses * 100,
            avg_time_saved_seconds: stats.avg_time_saved_seconds,
            success_rate: stats.success_rate
          } : void 0
        };
        context.logger.info(`Impact reported for ${observation_id}: helpful=${helpful}`);
        return {
          content: [{ type: "text", text: JSON.stringify(output, null, 2) }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Report impact failed:", message);
        return {
          content: [{ type: "text", text: JSON.stringify({ error: message }, null, 2) }]
        };
      }
    }
  );
}

// src/resources/domains.ts
function registerDomainsResource(server, context) {
  server.resource(
    "substrate://domains",
    "List of all observed domains with observation counts",
    async () => {
      try {
        const domains = context.storage.getAllDomains();
        const content = {
          domains: domains.map((d) => ({
            domain: d.domain,
            observation_count: d.count
          })),
          total_domains: domains.length
        };
        return {
          contents: [{
            uri: "substrate://domains",
            mimeType: "application/json",
            text: JSON.stringify(content, null, 2)
          }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Domains resource failed:", message);
        return {
          contents: [{
            uri: "substrate://domains",
            mimeType: "application/json",
            text: JSON.stringify({ error: message })
          }]
        };
      }
    }
  );
}

// src/resources/domain.ts
function registerDomainResource(server, context) {
  server.resource(
    "substrate://domain/{domain}",
    "Observations for a specific domain",
    async (uri) => {
      try {
        const match = uri.href.match(/substrate:\/\/domain\/(.+)/);
        if (!match) {
          return {
            contents: [{
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify({ error: "Invalid domain URI" })
            }]
          };
        }
        const domain = decodeURIComponent(match[1]);
        const observations = context.storage.query({
          domain,
          limit: 100
        });
        const stats = context.storage.getStats(domain);
        const content = {
          domain,
          observations,
          stats: {
            total: stats.total_observations,
            by_status: stats.observations_by_status,
            by_category: stats.observations_by_category
          }
        };
        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(content, null, 2)
          }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Domain resource failed:", message);
        return {
          contents: [{
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify({ error: message })
          }]
        };
      }
    }
  );
}

// src/resources/failures.ts
function registerFailuresResource(server, context) {
  server.resource(
    "substrate://failures/recent",
    "Recent failure signals from all domains",
    async () => {
      try {
        const since = new Date(Date.now() - 24 * 60 * 60 * 1e3).toISOString();
        const failures = context.storage.getFailures({
          since,
          limit: 50
        });
        const content = {
          failures,
          period: "24h",
          total_count: failures.length,
          generated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        return {
          contents: [{
            uri: "substrate://failures/recent",
            mimeType: "application/json",
            text: JSON.stringify(content, null, 2)
          }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Failures resource failed:", message);
        return {
          contents: [{
            uri: "substrate://failures/recent",
            mimeType: "application/json",
            text: JSON.stringify({ error: message })
          }]
        };
      }
    }
  );
}

// src/resources/stats.ts
function registerStatsResource(server, context) {
  server.resource(
    "substrate://stats",
    "Overall Substrate network statistics",
    async () => {
      try {
        const stats = context.storage.getStats();
        const vectorStats = await context.vectorSearch.getStats();
        const content = {
          observations: {
            total: stats.total_observations,
            by_status: stats.observations_by_status,
            by_category: stats.observations_by_category
          },
          domains: {
            total: stats.domains_count,
            top: stats.top_domains.slice(0, 10)
          },
          confirmation: {
            pending: stats.observations_by_status["pending"] ?? 0,
            confirmed: stats.observations_by_status["confirmed"] ?? 0,
            contradicted: stats.observations_by_status["contradicted"] ?? 0,
            stale: stats.observations_by_status["stale"] ?? 0,
            threshold: context.confirmationEngine.getThreshold()
          },
          vector_search: {
            available: context.vectorSearch.isAvailable(),
            indexed_points: vectorStats?.points_count ?? 0
          },
          sync: {
            enabled: context.syncCoordinator.isRunning(),
            peers: context.syncCoordinator.getPeers().length
          },
          generated_at: (/* @__PURE__ */ new Date()).toISOString()
        };
        return {
          contents: [{
            uri: "substrate://stats",
            mimeType: "application/json",
            text: JSON.stringify(content, null, 2)
          }]
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        context.logger.error("Stats resource failed:", message);
        return {
          contents: [{
            uri: "substrate://stats",
            mimeType: "application/json",
            text: JSON.stringify({ error: message })
          }]
        };
      }
    }
  );
}

// src/server.ts
async function createSubstrateServer(userConfig) {
  const { defer_vector_search, ...configOverrides } = userConfig ?? {};
  const dataDir = configOverrides?.data_dir ?? getDefaultDataDir();
  const baseConfig = createDefaultConfig(dataDir);
  const envConfig = configFromEnv(baseConfig);
  const config = { ...envConfig, ...configOverrides };
  const logger = createConsoleLogger(config.log_level);
  logger.info("Initializing Substrate MCP server...");
  const storage = new Storage(config);
  logger.info("Storage initialized");
  const vectorSearch = new VectorSearch(config);
  let vectorAvailable = false;
  const doInitializeVectorSearch = async () => {
    logger.info("Initializing vector search (this may take a while on first run)...");
    vectorAvailable = await vectorSearch.initialize();
    if (vectorAvailable) {
      logger.info("Vector search initialized");
    } else {
      logger.warn("Vector search not available - Qdrant may not be running");
    }
    return vectorAvailable;
  };
  if (!defer_vector_search) {
    await doInitializeVectorSearch();
  } else {
    logger.info("Vector search initialization deferred");
  }
  const confirmationConfig = config.confirmation ?? {
    threshold: 3,
    confidence_factor: 6,
    contradiction_window_hours: 24,
    stale_after_days: 30
  };
  const confirmationEngine = new ConfirmationEngine(storage, confirmationConfig, vectorSearch);
  logger.info("Confirmation engine initialized");
  const syncConfig = config.sync ?? {
    enabled: false,
    interval_ms: 6e4,
    urgent_interval_ms: 5e3,
    outbox_path: `${dataDir}/outbox`,
    peers: []
  };
  const syncCoordinator = new SyncCoordinator(storage, syncConfig, confirmationEngine, vectorSearch);
  if (syncConfig.enabled) {
    syncCoordinator.start();
    logger.info("Sync coordinator started");
  }
  const { hashAgentId: hashAgentId2 } = await Promise.resolve().then(() => (init_hash(), hash_exports));
  const agentId = config.agent_id ?? `substrate-server-${Date.now()}`;
  const agentHash = hashAgentId2(agentId);
  const context = {
    storage,
    vectorSearch,
    confirmationEngine,
    syncCoordinator,
    config,
    logger,
    agentHash
  };
  const server = new mcp_js.McpServer({
    name: "substrate",
    version: "0.2.0"
  });
  registerObserveTool(server, context);
  registerLookupTool(server, context);
  registerSearchTool(server, context);
  registerFailuresTool(server, context);
  registerConfirmTool(server, context);
  registerStatsTool(server, context);
  registerSemanticSearchTool(server, context);
  registerReportImpactTool(server, context);
  registerDomainsResource(server, context);
  registerDomainResource(server, context);
  registerFailuresResource(server, context);
  registerStatsResource(server, context);
  logger.info("Substrate MCP server ready");
  const cleanup = () => {
    logger.info("Shutting down Substrate MCP server...");
    syncCoordinator.stop();
    storage.close();
    logger.info("Shutdown complete");
  };
  const result = { server, context, cleanup };
  if (defer_vector_search) {
    result.initializeVectorSearch = doInitializeVectorSearch;
  }
  return result;
}
function createSSEServer(mcpServer, options) {
  const { port, host = "0.0.0.0", apiKey, corsOrigins = ["*"] } = options;
  let httpServer = null;
  let sseTransport = null;
  const setCorsHeaders = (res) => {
    res.setHeader("Access-Control-Allow-Origin", corsOrigins.join(", "));
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key");
  };
  const authenticate = (req) => {
    if (!apiKey) return true;
    const authHeader = req.headers["authorization"];
    const apiKeyHeader = req.headers["x-api-key"];
    if (authHeader === `Bearer ${apiKey}`) return true;
    if (apiKeyHeader === apiKey) return true;
    return false;
  };
  const handleRequest = async (req, res) => {
    setCorsHeaders(res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    if (req.url === "/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: "ok", transport: "sse" }));
      return;
    }
    if (!authenticate(req)) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Unauthorized" }));
      return;
    }
    if (req.url === "/sse" && req.method === "GET") {
      sseTransport = new sse_js.SSEServerTransport("/message", res);
      await mcpServer.connect(sseTransport);
      return;
    }
    if (req.url === "/message" && req.method === "POST") {
      if (!sseTransport) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "No active SSE connection" }));
        return;
      }
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", async () => {
        try {
          await sseTransport.handlePostMessage(req, res, body);
        } catch (error) {
          console.error("Error handling message:", error);
          if (!res.headersSent) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal server error" }));
          }
        }
      });
      return;
    }
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  };
  return {
    start: () => new Promise((resolve, reject) => {
      httpServer = http.createServer(handleRequest);
      httpServer.on("error", reject);
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
    }
  };
}

// src/index.ts
async function main() {
  const transportMode = process.env["SUBSTRATE_TRANSPORT"] ?? "stdio";
  const port = parseInt(process.env["PORT"] ?? process.env["SUBSTRATE_PORT"] ?? "3000", 10);
  const apiKey = process.env["SUBSTRATE_API_KEY"];
  const deferVectorSearch = transportMode === "sse" || transportMode === "http";
  const { server, cleanup, initializeVectorSearch } = await createSubstrateServer({
    defer_vector_search: deferVectorSearch
  });
  let sseServer = null;
  const shutdown = () => {
    console.log("Shutting down...");
    if (sseServer) sseServer.stop();
    cleanup();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  if (deferVectorSearch) {
    sseServer = createSSEServer(server, {
      port,
      apiKey,
      corsOrigins: process.env["SUBSTRATE_CORS_ORIGINS"]?.split(",") ?? ["*"]
    });
    await sseServer.start();
    console.log("Substrate MCP server running in SSE mode");
    if (apiKey) {
      console.log("API key authentication enabled");
    } else {
      console.warn("WARNING: No API key set. Server is publicly accessible.");
      console.warn("Set SUBSTRATE_API_KEY environment variable for production.");
    }
    if (initializeVectorSearch) {
      initializeVectorSearch().catch((err) => {
        console.warn("Vector search initialization failed:", err);
      });
    }
  } else {
    const transport = new stdio_js.StdioServerTransport();
    await server.connect(transport);
  }
}
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

exports.AggregationKey = AggregationKey;
exports.Aggregator = Aggregator;
exports.AuthData = AuthData;
exports.BehaviorData = BehaviorData;
exports.ConfirmInput = ConfirmInput;
exports.ConfirmOutput = ConfirmOutput;
exports.ConfirmationConfig = ConfirmationConfig;
exports.ConfirmationEngine = ConfirmationEngine;
exports.ContradictionDetector = ContradictionDetector;
exports.CreateObservation = CreateObservation;
exports.EmbeddingConfig = EmbeddingConfig;
exports.EmbeddingGenerator = EmbeddingGenerator;
exports.ErrorData = ErrorData;
exports.FailuresInput = FailuresInput;
exports.FailuresOutput = FailuresOutput;
exports.FileTransport = FileTransport;
exports.FormatData = FormatData;
exports.FuzzyMatcher = FuzzyMatcher;
exports.ImpactEstimate = ImpactEstimate;
exports.ImpactReport = ImpactReport;
exports.ImpactStats = ImpactStats;
exports.JSONLStorage = JSONLStorage;
exports.LookupInput = LookupInput;
exports.LookupOutput = LookupOutput;
exports.Observation = Observation;
exports.ObservationCategory = ObservationCategory;
exports.ObservationStatus = ObservationStatus;
exports.ObserveInput = ObserveInput;
exports.ObserveOutput = ObserveOutput;
exports.PeerConfig = PeerConfig;
exports.Promoter = Promoter;
exports.QdrantConfig = QdrantConfig;
exports.QdrantStorage = QdrantStorage;
exports.RateLimitData = RateLimitData;
exports.ReportImpactInput = ReportImpactInput;
exports.ReportImpactOutput = ReportImpactOutput;
exports.SQLiteStorage = SQLiteStorage;
exports.SearchInput = SearchInput;
exports.SearchOutput = SearchOutput;
exports.SearchResult = SearchResult;
exports.SemanticSearchInput = SemanticSearchInput;
exports.SemanticSearchOutput = SemanticSearchOutput;
exports.StatsInput = StatsInput;
exports.StatsOutput = StatsOutput;
exports.Storage = Storage;
exports.StoredObservation = StoredObservation;
exports.StructuredData = StructuredData;
exports.SubstrateConfig = SubstrateConfig;
exports.SyncConfig = SyncConfig;
exports.SyncCoordinator = SyncCoordinator;
exports.UrgencyLevel = UrgencyLevel;
exports.UrgentSignalHandler = UrgentSignalHandler;
exports.VectorSearch = VectorSearch;
exports.configFromEnv = configFromEnv;
exports.createDefaultConfig = createDefaultConfig;
exports.createSubstrateServer = createSubstrateServer;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map