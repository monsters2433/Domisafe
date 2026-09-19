export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info' | 'unavailable';

export type CheckCategory =
  | 'tls'
  | 'headers'
  | 'dns'
  | 'whois'
  | 'blocklists'
  | 'reputation'
  | 'exposure'
  | 'breaches';

export interface CheckDetail {
  label: string;
  value: string;
  status?: CheckStatus;
}

export interface CheckResult {
  id: string;
  category: CheckCategory;
  title: string;
  status: CheckStatus;
  /** 0-100. Se ignora cuando status es 'unavailable'. */
  score: number;
  /** Peso relativo dentro de la nota global. */
  weight: number;
  summary: string;
  details: CheckDetail[];
  recommendation?: string;
  /** De dónde salen los datos, para mostrarlo en el informe. */
  source: string;
}

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface ScanReport {
  domain: string;
  scannedAt: string;
  durationMs: number;
  cached: boolean;
  /** 1 = pasivo y público. 2 = activo, requiere propiedad verificada. */
  level: 1 | 2;
  score: number;
  grade: Grade;
  checks: CheckResult[];
  /** true en Fase 1: los datos son de ejemplo, no reales. */
  mock: boolean;
}

export interface CategoryMeta {
  label: string;
  description: string;
}

export const CATEGORY_META: Record<CheckCategory, CategoryMeta> = {
  tls: { label: 'Certificado TLS', description: 'Validez, cadena de confianza y algoritmos del certificado.' },
  headers: { label: 'Cabeceras HTTP', description: 'Cabeceras de seguridad que envía el servidor web.' },
  dns: { label: 'DNS y correo', description: 'SPF, DKIM, DMARC y registros MX.' },
  whois: { label: 'Registro del dominio', description: 'Antigüedad, registrador y fecha de expiración.' },
  blocklists: { label: 'Listas negras', description: 'Presencia en listas de spam y malware.' },
  reputation: { label: 'Reputación de IP', description: 'Histórico de abuso asociado a la IP del dominio.' },
  exposure: { label: 'Superficie expuesta', description: 'Subdominios y puertos conocidos por fuentes públicas.' },
  breaches: { label: 'Filtraciones', description: 'Brechas de datos públicas que afectan al dominio.' },
};

export const STATUS_META: Record<CheckStatus, { label: string; tone: string }> = {
  pass: { label: 'Correcto', tone: 'pass' },
  warn: { label: 'Mejorable', tone: 'warn' },
  fail: { label: 'Problema', tone: 'fail' },
  info: { label: 'Informativo', tone: 'info' },
  unavailable: { label: 'No disponible', tone: 'info' },
};
