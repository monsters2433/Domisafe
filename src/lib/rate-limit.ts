import { runtimeConfig } from './config';

/**
 * Rate limiting a nivel de aplicación (segunda capa; la primera es limit_req
 * de Nginx y, antes aún, la regla WAF de Cloudflare).
 *
 * Ventana deslizante sencilla en memoria. Suficiente para una sola instancia
 * PM2 y con coste de memoria acotado por la limpieza periódica. Si algún día
 * hay varias instancias, esto pasa a SQLite/Redis sin cambiar la interfaz.
 */

interface Bucket {
  hits: number[];
  expiresAt: number;
}

// Mismo motivo que en store.ts: el estado debe sobrevivir a que Next.js cargue
// este módulo desde varios bundles del mismo proceso.
const globalStore = globalThis as typeof globalThis & { __domisafeRateBuckets?: Map<string, Bucket> };
const buckets: Map<string, Bucket> = (globalStore.__domisafeRateBuckets ??= new Map());

const MAX_KEYS = 20_000;

function sweep(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(
  key: string,
  max = runtimeConfig.rateLimit.maxScans,
  windowSeconds = runtimeConfig.rateLimit.windowSeconds,
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  if (buckets.size > MAX_KEYS) sweep(now);

  const bucket = buckets.get(key) ?? { hits: [], expiresAt: now + windowMs };
  bucket.hits = bucket.hits.filter((timestamp) => now - timestamp < windowMs);

  if (bucket.hits.length >= max) {
    const oldest = bucket.hits[0];
    bucket.expiresAt = oldest + windowMs;
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + windowMs - now) / 1000)),
    };
  }

  bucket.hits.push(now);
  bucket.expiresAt = now + windowMs;
  buckets.set(key, bucket);

  return { allowed: true, remaining: max - bucket.hits.length, retryAfterSeconds: 0 };
}

/**
 * IP real del visitante. Con Cloudflare Tunnel + Nginx la cabecera fiable es
 * CF-Connecting-IP; X-Forwarded-For se acepta como respaldo porque Nginx ya la
 * reescribe con real_ip. Nunca se confía en cabeceras enviadas por el cliente
 * sin ese saneado previo.
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get('cf-connecting-ip');
  if (cf) return cf.trim();

  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  return headers.get('x-real-ip')?.trim() || 'unknown';
}
