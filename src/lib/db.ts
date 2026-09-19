import path from 'path';

let db: any = null;
let memoryFallback = false;
let memoryReports: Map<string, any> = new Map();
let memoryLogs: any[] = [];

// Intenta cargar better-sqlite3, con fallback a caché de memoria si no está disponible
function tryInitSQLite() {
  try {
    // eslint-disable-next-line global-require
    const Database = require('better-sqlite3');
    const dataDir = path.join(process.cwd(), 'data');
    const dbPath = path.join(dataDir, 'domisafe.db');

    const database = new Database(dbPath);
    database.pragma('foreign_keys = ON');

    // Tablas
    database.exec(`
      CREATE TABLE IF NOT EXISTS scan_reports (
        domain TEXT PRIMARY KEY,
        report_json TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        cached_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS scan_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        status TEXT,
        duration_ms INTEGER,
        scanned_at INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_scan_reports_expires_at ON scan_reports(expires_at);
      CREATE INDEX IF NOT EXISTS idx_scan_logs_domain ON scan_logs(domain);
      CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_at ON scan_logs(scanned_at);
      CREATE INDEX IF NOT EXISTS idx_scan_logs_ip_address ON scan_logs(ip_address);
    `);

    console.log('[db] SQLite inicializado correctamente');
    return database;
  } catch (error) {
    memoryFallback = true;
    console.warn('[db] SQLite no disponible, usando caché de memoria:', error instanceof Error ? error.message : error);
    return null;
  }
}

export function initDatabase() {
  if (db || memoryFallback) return db;
  db = tryInitSQLite();
  return db;
}

export function getDatabase() {
  if (!db && !memoryFallback) {
    initDatabase();
  }
  return db;
}

// Limpieza de reportes expirados
export function cleanupExpiredReports(): number {
  if (memoryFallback) {
    const now = Date.now();
    let count = 0;
    for (const [key, entry] of memoryReports) {
      if (entry.expiresAt <= now) {
        memoryReports.delete(key);
        count++;
      }
    }
    return count;
  }

  const database = getDatabase();
  if (!database) return 0;

  try {
    const stmt = database.prepare('DELETE FROM scan_reports WHERE expires_at <= ?');
    const result = stmt.run(Date.now());
    return result.changes;
  } catch (error) {
    console.error('[db] Error limpiando reportes:', error);
    return 0;
  }
}

export interface ScanLogEntry {
  domain: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'error' | 'rate_limited' | 'invalid_domain';
  durationMs?: number;
  scannedAt: number;
}

export function logScan(entry: ScanLogEntry): void {
  if (memoryFallback) {
    memoryLogs.push({
      domain: entry.domain,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
      status: entry.status,
      duration_ms: entry.durationMs || null,
      scanned_at: entry.scannedAt,
      created_at: Date.now(),
    });
    return;
  }

  const database = getDatabase();
  if (!database) return;

  try {
    const stmt = database.prepare(`
      INSERT INTO scan_logs (domain, ip_address, user_agent, status, duration_ms, scanned_at, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      entry.domain,
      entry.ipAddress || null,
      entry.userAgent || null,
      entry.status,
      entry.durationMs || null,
      entry.scannedAt,
      Date.now(),
    );
  } catch (error) {
    console.error('[db] Error registrando scan:', error);
  }
}

export interface ScanStats {
  totalScans: number;
  uniqueDomains: number;
  successCount: number;
  errorCount: number;
  rateLimitedCount: number;
  invalidDomainCount: number;
  topDomains: Array<{ domain: string; count: number }>;
  lastScanTime: number | null;
}

export function getScanStats(lastDaysCount = 7): ScanStats {
  if (memoryFallback) {
    const daysAgo = Date.now() - lastDaysCount * 24 * 60 * 60 * 1000;
    const filtered = memoryLogs.filter((log) => log.created_at > daysAgo);

    const uniqueDomains = new Set(filtered.map((log) => log.domain)).size;
    const statusCounts = filtered.reduce(
      (acc, log) => {
        acc[log.status] = (acc[log.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topDomainsMap = filtered.reduce(
      (acc, log) => {
        acc[log.domain] = (acc[log.domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topDomains: Array<{ domain: string; count: number }> = Object.entries(topDomainsMap)
      .map(([domain, count]) => ({ domain, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalScans: filtered.length,
      uniqueDomains,
      successCount: statusCounts['success'] || 0,
      errorCount: statusCounts['error'] || 0,
      rateLimitedCount: statusCounts['rate_limited'] || 0,
      invalidDomainCount: statusCounts['invalid_domain'] || 0,
      topDomains,
      lastScanTime: filtered.length > 0 ? Math.max(...filtered.map((log) => log.created_at)) : null,
    };
  }

  const database = getDatabase();
  if (!database) {
    return {
      totalScans: 0,
      uniqueDomains: 0,
      successCount: 0,
      errorCount: 0,
      rateLimitedCount: 0,
      invalidDomainCount: 0,
      topDomains: [],
      lastScanTime: null,
    };
  }

  try {
    const daysAgo = Date.now() - lastDaysCount * 24 * 60 * 60 * 1000;

    const totalResult = database.prepare('SELECT COUNT(*) as count FROM scan_logs WHERE created_at > ?').get(daysAgo) as {
      count: number;
    };

    const uniqueResult = database
      .prepare('SELECT COUNT(DISTINCT domain) as count FROM scan_logs WHERE created_at > ?')
      .get(daysAgo) as { count: number };

    const statusCounts = database
      .prepare('SELECT status, COUNT(*) as count FROM scan_logs WHERE created_at > ? GROUP BY status')
      .all(daysAgo) as Array<{ status: string; count: number }>;

    const topDomainsResult = database
      .prepare(
        'SELECT domain, COUNT(*) as count FROM scan_logs WHERE created_at > ? GROUP BY domain ORDER BY count DESC LIMIT 10',
      )
      .all(daysAgo) as Array<{ domain: string; count: number }>;

    const lastScanResult = database.prepare('SELECT MAX(created_at) as last_scan FROM scan_logs').get() as {
      last_scan: number | null;
    };

    const statusMap = Object.fromEntries(statusCounts.map(({ status, count }) => [status, count]));

    return {
      totalScans: totalResult.count,
      uniqueDomains: uniqueResult.count,
      successCount: statusMap['success'] || 0,
      errorCount: statusMap['error'] || 0,
      rateLimitedCount: statusMap['rate_limited'] || 0,
      invalidDomainCount: statusMap['invalid_domain'] || 0,
      topDomains: topDomainsResult,
      lastScanTime: lastScanResult.last_scan,
    };
  } catch (error) {
    console.error('[db] Error calculando stats:', error);
    return {
      totalScans: 0,
      uniqueDomains: 0,
      successCount: 0,
      errorCount: 0,
      rateLimitedCount: 0,
      invalidDomainCount: 0,
      topDomains: [],
      lastScanTime: null,
    };
  }
}

// Para reportes, usamos store.ts que ya tiene la lógica
