import { runtimeConfig } from './config';
import type { ScanReport } from './types';
import { initDatabase, logScan, getDatabase } from './db';

/**
 * Caché de informes con persistencia en SQLite (Fase 2).
 *
 * Usa SQLite si está disponible (desarrollo/producción con node_modules).
 * Fallback a caché en memoria si better-sqlite3 no se puede cargar
 * (ej. build standalone sin node_modules).
 *
 * Mantiene la misma interfaz pública: getReport / saveReport.
 */

// Fallback a memoria si SQLite no está disponible
interface Entry {
  report: ScanReport;
  expiresAt: number;
}

const globalStore = globalThis as typeof globalThis & { __domisafeReports?: Map<string, Entry> };
const memoryReports: Map<string, Entry> = (globalStore.__domisafeReports ??= new Map());
const MAX_MEMORY_ENTRIES = 500;

export function getReport(domain: string): ScanReport | null {
  try {
    const db = getDatabase();

    if (db) {
      // Usar SQLite
      const now = Date.now();

      // Limpieza oportunista
      if (Math.random() < 0.01) {
        try {
          const stmt = db.prepare('DELETE FROM scan_reports WHERE expires_at <= ?');
          stmt.run(now);
        } catch (error) {
          console.error('[store] Error limpiando reportes:', error);
        }
      }

      const row = db
        .prepare('SELECT report_json FROM scan_reports WHERE domain = ? AND expires_at > ?')
        .get(domain, now) as { report_json: string } | undefined;

      if (row) {
        const report = JSON.parse(row.report_json) as ScanReport;
        return { ...report, cached: true };
      }
    } else {
      // Fallback a memoria
      const entry = memoryReports.get(domain);
      if (entry && entry.expiresAt > Date.now()) {
        return { ...entry.report, cached: true };
      }
    }

    return null;
  } catch (error) {
    console.error(`[store] Error reading report for ${domain}:`, error);
    return null;
  }
}

export function saveReport(report: ScanReport): void {
  try {
    const db = getDatabase();
    const expiresAt = Date.now() + runtimeConfig.cacheTtlSeconds * 1000;

    if (db) {
      // Usar SQLite
      const stmt = db.prepare(`
        INSERT INTO scan_reports (domain, report_json, expires_at, cached_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(domain) DO UPDATE SET
          report_json = excluded.report_json,
          expires_at = excluded.expires_at,
          cached_at = excluded.cached_at
      `);

      stmt.run(report.domain, JSON.stringify(report), expiresAt, Math.floor(Date.now()));
    } else {
      // Fallback a memoria
      if (memoryReports.size >= MAX_MEMORY_ENTRIES) {
        const oldest = memoryReports.keys().next().value;
        if (oldest !== undefined) memoryReports.delete(oldest);
      }
      memoryReports.set(report.domain, { report, expiresAt });
    }

    // Log del escaneo
    logScan({
      domain: report.domain,
      status: 'success',
      durationMs: report.durationMs,
      scannedAt: Date.now(),
    });
  } catch (error) {
    console.error(`[store] Error saving report for ${report.domain}:`, error);
  }
}
