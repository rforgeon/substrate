import Database from 'better-sqlite3';
import type { StoredObservation, ObservationStatus, ObservationCategory } from '../schemas/observation.js';
import { runMigrations } from './migrations/index.js';

export interface QueryOptions {
  domain?: string;
  path?: string;
  category?: ObservationCategory;
  status?: ObservationStatus;
  since?: string;
  limit?: number;
  offset?: number;
}

export interface ConfirmationGroup {
  id: number;
  domain: string;
  path: string | null;
  category: string;
  content_hash: string;
  canonical_observation_id: string;
  total_confirmations: number;
  unique_agents: string[];
  status: ObservationStatus;
  confidence: number;
  created_at: string;
  updated_at: string;
}

export interface DomainStats {
  domain: string;
  count: number;
}

export interface ObservationStats {
  total_observations: number;
  observations_by_status: Record<string, number>;
  observations_by_category: Record<string, number>;
  domains_count: number;
  top_domains: DomainStats[];
}

export class SQLiteStorage {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    runMigrations(this.db);
  }

  // ============================================================================
  // Observation CRUD
  // ============================================================================

  insertObservation(observation: StoredObservation): void {
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

  getObservation(id: string): StoredObservation | null {
    const row = this.db.prepare('SELECT * FROM observations WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? this.rowToObservation(row) : null;
  }

  updateObservation(id: string, updates: Partial<StoredObservation>): void {
    const current = this.getObservation(id);
    if (!current) return;

    const updated = { ...current, ...updates, updated_at: new Date().toISOString() };

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
  addImpactReport(id: string, report: {
    agent_hash: string;
    helpful: boolean;
    task_succeeded?: boolean;
    actual_time_saved_seconds?: number;
    feedback?: string;
  }): { success: boolean; updated_stats?: StoredObservation['impact_stats'] } {
    const observation = this.getObservation(id);
    if (!observation) {
      return { success: false };
    }

    // Add the report
    const reports = observation.impact_reports ?? [];
    reports.push({
      ...report,
      reported_at: new Date().toISOString(),
    });

    // Calculate updated stats
    const totalUses = reports.length;
    const helpfulCount = reports.filter(r => r.helpful).length;
    const successReports = reports.filter(r => r.task_succeeded !== undefined);
    const successCount = successReports.filter(r => r.task_succeeded).length;
    const timeReports = reports.filter(r => r.actual_time_saved_seconds !== undefined);
    const avgTimeSaved = timeReports.length > 0
      ? timeReports.reduce((sum, r) => sum + (r.actual_time_saved_seconds ?? 0), 0) / timeReports.length
      : undefined;

    const updatedStats = {
      total_uses: totalUses,
      helpful_count: helpfulCount,
      avg_time_saved_seconds: avgTimeSaved,
      success_rate: successReports.length > 0
        ? (successCount / successReports.length) * 100
        : undefined,
    };

    this.updateObservation(id, {
      impact_reports: reports,
      impact_stats: updatedStats,
    });

    return { success: true, updated_stats: updatedStats };
  }

  queryObservations(options: QueryOptions): StoredObservation[] {
    let sql = 'SELECT * FROM observations WHERE 1=1';
    const params: unknown[] = [];

    if (options.domain) {
      sql += ' AND domain = ?';
      params.push(options.domain);
    }

    if (options.path) {
      sql += ' AND path = ?';
      params.push(options.path);
    }

    if (options.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    if (options.since) {
      sql += ' AND created_at >= ?';
      params.push(options.since);
    }

    sql += ' ORDER BY created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.rowToObservation(row));
  }

  countObservations(options: QueryOptions): number {
    let sql = 'SELECT COUNT(*) as count FROM observations WHERE 1=1';
    const params: unknown[] = [];

    if (options.domain) {
      sql += ' AND domain = ?';
      params.push(options.domain);
    }

    if (options.path) {
      sql += ' AND path = ?';
      params.push(options.path);
    }

    if (options.category) {
      sql += ' AND category = ?';
      params.push(options.category);
    }

    if (options.status) {
      sql += ' AND status = ?';
      params.push(options.status);
    }

    const row = this.db.prepare(sql).get(...params) as { count: number };
    return row.count;
  }

  // ============================================================================
  // Confirmation Groups
  // ============================================================================

  findConfirmationGroup(
    domain: string,
    path: string | undefined,
    category: string,
    contentHash: string
  ): ConfirmationGroup | null {
    const row = this.db.prepare(`
      SELECT * FROM confirmation_groups
      WHERE domain = ? AND path IS ? AND category = ? AND content_hash = ?
    `).get(domain, path ?? null, category, contentHash) as Record<string, unknown> | undefined;

    return row ? this.rowToConfirmationGroup(row) : null;
  }

  createConfirmationGroup(
    domain: string,
    path: string | undefined,
    category: string,
    contentHash: string,
    observationId: string,
    agentHash: string
  ): ConfirmationGroup {
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO confirmation_groups (
        domain, path, category, content_hash, canonical_observation_id,
        total_confirmations, unique_agents, status, confidence, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, 'pending', 0, ?, ?)
    `).run(domain, path ?? null, category, contentHash, observationId, JSON.stringify([agentHash]), now, now);

    return this.findConfirmationGroup(domain, path, category, contentHash)!;
  }

  updateConfirmationGroup(
    id: number,
    updates: Partial<Pick<ConfirmationGroup, 'total_confirmations' | 'unique_agents' | 'status' | 'confidence'>>
  ): void {
    const now = new Date().toISOString();

    if (updates.total_confirmations !== undefined || updates.unique_agents !== undefined) {
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

  getStats(domain?: string): ObservationStats {
    const whereClause = domain ? 'WHERE domain = ?' : '';
    const params = domain ? [domain] : [];

    const totalRow = this.db.prepare(`SELECT COUNT(*) as count FROM observations ${whereClause}`).get(...params) as { count: number };

    const statusRows = this.db.prepare(`
      SELECT status, COUNT(*) as count FROM observations ${whereClause} GROUP BY status
    `).all(...params) as { status: string; count: number }[];

    const categoryRows = this.db.prepare(`
      SELECT category, COUNT(*) as count FROM observations ${whereClause} GROUP BY category
    `).all(...params) as { category: string; count: number }[];

    const domainsRow = this.db.prepare('SELECT COUNT(DISTINCT domain) as count FROM observations').get() as { count: number };

    const topDomainsRows = this.db.prepare(`
      SELECT domain, COUNT(*) as count FROM observations
      GROUP BY domain ORDER BY count DESC LIMIT 10
    `).all() as DomainStats[];

    return {
      total_observations: totalRow.count,
      observations_by_status: Object.fromEntries(statusRows.map(r => [r.status, r.count])),
      observations_by_category: Object.fromEntries(categoryRows.map(r => [r.category, r.count])),
      domains_count: domainsRow.count,
      top_domains: topDomainsRows,
    };
  }

  getAllDomains(): DomainStats[] {
    const rows = this.db.prepare(`
      SELECT domain, COUNT(*) as count FROM observations
      GROUP BY domain ORDER BY count DESC
    `).all() as DomainStats[];
    return rows;
  }

  // ============================================================================
  // Failures
  // ============================================================================

  getFailures(options: { domain?: string; since?: string; limit?: number }): StoredObservation[] {
    let sql = `
      SELECT * FROM observations
      WHERE category = 'error' AND (urgency = 'high' OR urgency = 'critical')
    `;
    const params: unknown[] = [];

    if (options.domain) {
      sql += ' AND domain = ?';
      params.push(options.domain);
    }

    if (options.since) {
      sql += ' AND created_at >= ?';
      params.push(options.since);
    }

    sql += ' ORDER BY created_at DESC';

    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    const rows = this.db.prepare(sql).all(...params) as Record<string, unknown>[];
    return rows.map(row => this.rowToObservation(row));
  }

  // ============================================================================
  // Sync State
  // ============================================================================

  getSyncState(peerName: string): { last_sync_at: string | null; last_observation_id: string | null; sync_count: number } | null {
    const row = this.db.prepare('SELECT * FROM sync_state WHERE peer_name = ?').get(peerName) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      last_sync_at: row['last_sync_at'] as string | null,
      last_observation_id: row['last_observation_id'] as string | null,
      sync_count: row['sync_count'] as number,
    };
  }

  updateSyncState(peerName: string, lastSyncAt: string, lastObservationId: string): void {
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

  private rowToObservation(row: Record<string, unknown>): StoredObservation {
    return {
      id: row['id'] as string,
      agent_hash: row['agent_hash'] as string,
      domain: row['domain'] as string,
      path: row['path'] as string | undefined,
      category: row['category'] as ObservationCategory,
      summary: row['summary'] as string,
      structured_data: row['structured_data'] ? JSON.parse(row['structured_data'] as string) : undefined,
      impact_estimate: row['impact_estimate'] ? JSON.parse(row['impact_estimate'] as string) : undefined,
      impact_reports: row['impact_reports'] ? JSON.parse(row['impact_reports'] as string) : [],
      impact_stats: row['impact_stats'] ? JSON.parse(row['impact_stats'] as string) : undefined,
      status: row['status'] as ObservationStatus,
      confirmations: row['confirmations'] as number,
      confirming_agents: JSON.parse(row['confirming_agents'] as string),
      confidence: row['confidence'] as number,
      urgency: row['urgency'] as 'normal' | 'high' | 'critical',
      tags: JSON.parse(row['tags'] as string),
      content_hash: row['content_hash'] as string,
      vector_id: row['vector_id'] as string | undefined,
      created_at: row['created_at'] as string,
      updated_at: row['updated_at'] as string,
      expires_at: row['expires_at'] as string | undefined,
    };
  }

  private rowToConfirmationGroup(row: Record<string, unknown>): ConfirmationGroup {
    return {
      id: row['id'] as number,
      domain: row['domain'] as string,
      path: row['path'] as string | null,
      category: row['category'] as string,
      content_hash: row['content_hash'] as string,
      canonical_observation_id: row['canonical_observation_id'] as string,
      total_confirmations: row['total_confirmations'] as number,
      unique_agents: JSON.parse(row['unique_agents'] as string),
      status: row['status'] as ObservationStatus,
      confidence: row['confidence'] as number,
      created_at: row['created_at'] as string,
      updated_at: row['updated_at'] as string,
    };
  }

  close(): void {
    this.db.close();
  }
}
