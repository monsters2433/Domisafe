import { NextResponse } from 'next/server';
import { getScanStats } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Endpoint de estadísticas (privado).
 *
 * TODO: En producción, proteger con token de admin.
 * Por ahora, solo accessible desde la red privada (127.0.0.1).
 */
export async function GET(request: Request) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                   request.headers.get('cf-connecting-ip') ||
                   'unknown';

  // Restricción básica: solo localhost (en la red privada)
  if (clientIp !== '127.0.0.1' && clientIp !== 'localhost' && !clientIp.startsWith('192.168.') && !clientIp.startsWith('10.')) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
  }

  try {
    const lastDays = Number(new URL(request.url).searchParams.get('days') || '7');
    const stats = getScanStats(lastDays);

    return NextResponse.json({
      period: `últimos ${lastDays} días`,
      ...stats,
    });
  } catch (error) {
    console.error('[stats] Error:', error);
    return NextResponse.json({ error: 'Error al calcular estadísticas' }, { status: 500 });
  }
}
