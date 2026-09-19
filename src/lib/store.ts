import { runtimeConfig } from './config';
import type { ScanReport } from './types';

/**
 * Caché de informes.
 *
 * Fase 1: memoria del proceso, con TTL y tope de entradas para no crecer sin
 * control en un servidor doméstico. Fase 2 lo sustituye por SQLite manteniendo
 * esta misma interfaz (getReport / saveReport).
 *
 * La caché es la razón de que un segundo escaneo del mismo dominio no gaste
 * llamadas de pago a APIs externas.
 */

interface Entry {
  report: ScanReport;
  expiresAt: number;
}

/**
 * Anclado a globalThis: Next.js puede cargar este módulo en más de un bundle
 * (route handler y componente de servidor), y con una constante de módulo cada
 * uno tendría su propia copia del Map, de modo que la página nunca vería lo que
 * guardó la API.
 */
const globalStore = globalThis as typeof globalThis & { __domisafeReports?: Map<string, Entry> };
const reports: Map<string, Entry> = (globalStore.__domisafeReports ??= new Map());

const MAX_ENTRIES = 500;

export function getReport(domain: string): ScanReport | null {
  const entry = reports.get(domain);
  if (!entry) return null;

  if (entry.expiresAt <= Date.now()) {
    reports.delete(domain);
    return null;
  }

  return { ...entry.report, cached: true };
}

export function saveReport(report: ScanReport): void {
  if (reports.size >= MAX_ENTRIES) {
    // Map conserva orden de inserción: la entrada más antigua es la primera.
    const oldest = reports.keys().next().value;
    if (oldest !== undefined) reports.delete(oldest);
  }

  reports.set(report.domain, {
    report,
    expiresAt: Date.now() + runtimeConfig.cacheTtlSeconds * 1000,
  });
}
