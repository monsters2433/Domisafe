function int(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const siteConfig = {
  name: 'Domisafe',
  domain: 'domisafe.org',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://domisafe.org',
  tagline: 'Verificación de seguridad de dominios',
  description:
    'Analiza gratis la seguridad de cualquier dominio: certificado SSL/TLS, cabeceras HTTP, SPF, DKIM, DMARC, listas negras y reputación. Informe claro en segundos.',
  locale: 'es_ES',
  twitter: '@domisafe',
} as const;

export const runtimeConfig = {
  rateLimit: {
    windowSeconds: int(process.env.RATE_LIMIT_WINDOW_SECONDS, 600),
    maxScans: int(process.env.RATE_LIMIT_MAX_SCANS, 10),
  },
  cacheTtlSeconds: int(process.env.SCAN_CACHE_TTL_SECONDS, 21600),
} as const;

export const adsenseConfig = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? '',
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === 'true',
} as const;
