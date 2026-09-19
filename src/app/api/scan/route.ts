import { NextResponse } from 'next/server';

import { parseDomain } from '@/lib/domain';
import { buildMockReport } from '@/lib/mock';
import { checkRateLimit, clientIp } from '@/lib/rate-limit';
import { getReport, saveReport } from '@/lib/store';
import { verifyTurnstile } from '@/lib/turnstile';
import { logScan } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Orden de comprobaciones, de más barato a más caro:
 *   1. Rate limit por IP      (memoria, coste cero)
 *   2. Validación del dominio (coste cero)
 *   3. Turnstile              (una llamada de red)
 *   4. Caché                  (evita rehacer el trabajo)
 *   5. Checks                 (Fase 1: mock)
 *
 * Así el tráfico abusivo se descarta antes de gastar nada.
 */
export async function POST(request: Request) {
  const ip = clientIp(request.headers);
  const userAgent = request.headers.get('user-agent') || undefined;

  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Has hecho demasiados análisis. Espera un momento antes de volver a intentarlo.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: { domain?: string; turnstileToken?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Petición no válida.' }, { status: 400 });
  }

  const parsed = parseDomain(payload.domain ?? '');
  if (!parsed.ok) {
    logScan({
      domain: payload.domain ?? 'unknown',
      ipAddress: ip,
      userAgent,
      status: 'invalid_domain',
      scannedAt: Date.now(),
    });
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const turnstile = await verifyTurnstile(payload.turnstileToken, ip);
  if (!turnstile.ok) {
    logScan({
      domain: parsed.domain,
      ipAddress: ip,
      userAgent,
      status: 'error',
      scannedAt: Date.now(),
    });
    return NextResponse.json({ error: turnstile.error }, { status: turnstile.status });
  }

  const cached = getReport(parsed.domain);
  if (cached) {
    return NextResponse.json({ report: cached });
  }

  const startTime = Date.now();
  const report = buildMockReport(parsed.domain);
  saveReport(report);
  const durationMs = Date.now() - startTime;

  // Log con duración (saveReport ya hace log de success internamente)
  logScan({
    domain: parsed.domain,
    ipAddress: ip,
    userAgent,
    status: 'success',
    durationMs,
    scannedAt: Date.now(),
  });

  return NextResponse.json({ report });
}
