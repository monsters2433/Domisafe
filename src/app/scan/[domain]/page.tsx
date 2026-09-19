import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdSlot } from '@/components/AdSlot';
import { CheckCard } from '@/components/CheckCard';
import { ScanForm } from '@/components/ScanForm';
import { ScoreGauge } from '@/components/ScoreGauge';
import { parseDomain } from '@/lib/domain';
import { scoreVerdict } from '@/lib/scoring';
import { getReport } from '@/lib/store';
import type { CheckStatus, ScanReport } from '@/lib/types';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { domain: raw } = await params;
  const parsed = parseDomain(decodeURIComponent(raw));

  if (!parsed.ok) return { title: 'Dominio no válido', robots: { index: false, follow: false } };

  return {
    title: `Informe de seguridad de ${parsed.domain}`,
    description: `Análisis de seguridad de ${parsed.domain}: certificado SSL/TLS, cabeceras HTTP, SPF, DKIM, DMARC, listas negras y reputación de IP.`,
    // Los informes son efímeros y se generan bajo demanda: no tiene sentido
    // que Google indexe una página por dominio del mundo.
    robots: { index: false, follow: true },
  };
}

function countByStatus(report: ScanReport, status: CheckStatus): number {
  return report.checks.filter((check) => check.status === status).length;
}

export default async function ScanResultPage({ params }: PageProps) {
  const { domain: raw } = await params;
  const parsed = parseDomain(decodeURIComponent(raw));

  if (!parsed.ok) notFound();

  const report = getReport(parsed.domain);

  // Sin informe en caché no se genera uno aquí: crearlo exige pasar por
  // /api/scan, que es donde viven el rate limiting y Turnstile.
  if (!report) {
    return (
      <div className="container-page py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight">No hay ningún informe reciente de {parsed.domain}</h1>
          <p className="mt-4 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Los informes caducan al cabo de unas horas. Lanza el análisis de nuevo para ver los datos actualizados.
          </p>
          <div className="mt-8 text-left">
            <ScanForm initialDomain={parsed.domain} autoFocus />
          </div>
        </div>
      </div>
    );
  }

  const failures = countByStatus(report, 'fail');
  const warnings = countByStatus(report, 'warn');
  const passes = countByStatus(report, 'pass');

  return (
    <div className="container-page py-12">
      {report.mock ? (
        <p
          className="mb-6 rounded-lg border px-4 py-3 text-sm"
          style={{ borderColor: 'var(--warn)', backgroundColor: 'var(--warn-bg)', color: 'var(--warn)' }}
        >
          <strong>Datos de demostración.</strong> Esta versión genera un informe de ejemplo para validar el diseño. Los
          análisis reales llegan en la siguiente fase.
        </p>
      ) : null}

      {/* Resumen */}
      <section className="surface animate-rise p-7 sm:p-9">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <ScoreGauge score={report.score} grade={report.grade} />

          <div className="min-w-0 flex-1">
            <p className="text-sm" style={{ color: 'var(--fg-subtle)' }}>
              Informe de seguridad
            </p>
            <h1 className="mt-1 break-all text-3xl font-semibold tracking-tight sm:text-4xl">{report.domain}</h1>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              {scoreVerdict(report.score)}
            </p>

            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: 'var(--pass)' }} />
                <dt style={{ color: 'var(--fg-muted)' }}>Correctas</dt>
                <dd className="font-medium">{passes}</dd>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: 'var(--warn)' }} />
                <dt style={{ color: 'var(--fg-muted)' }}>Mejorables</dt>
                <dd className="font-medium">{warnings}</dd>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ backgroundColor: 'var(--fail)' }} />
                <dt style={{ color: 'var(--fg-muted)' }}>Problemas</dt>
                <dd className="font-medium">{failures}</dd>
              </div>
            </dl>

            <p className="mt-5 text-xs" style={{ color: 'var(--fg-subtle)' }}>
              Analizado el{' '}
              <time dateTime={report.scannedAt}>
                {new Date(report.scannedAt).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
              </time>
              {report.cached ? ' · resultado en caché' : ` · ${(report.durationMs / 1000).toFixed(1)} s`}
            </p>
          </div>
        </div>
      </section>

      {/* Detalle */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold tracking-tight">Detalle del análisis</h2>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--fg-muted)' }}>
          Pulsa en cada comprobación para ver los datos completos y la recomendación.
        </p>

        <div className="mt-5 space-y-3">
          {report.checks.map((check, index) => (
            <CheckCard key={check.id} check={check} index={index} />
          ))}
        </div>
      </section>

      <AdSlot slot="0000000000" label="report-end" className="mt-8" />

      {/* Nivel 2 */}
      <section className="surface mt-8 p-7">
        <h2 className="text-lg font-semibold tracking-tight">¿Eres el propietario de {report.domain}?</h2>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          Verificando la propiedad con un registro TXT en el DNS desbloquearás el análisis avanzado: escaneo de puertos
          autorizado, detección de versiones de servicios y contraste con vulnerabilidades conocidas. Disponible en
          breve.
        </p>
      </section>

      <div className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Analizar otro dominio</h2>
        <div className="mt-4 max-w-2xl">
          <ScanForm />
        </div>
      </div>

      <p className="mt-10 text-center text-sm">
        <Link href="/blog" style={{ color: 'var(--accent)' }}>
          ¿No sabes por dónde empezar? Consulta las guías →
        </Link>
      </p>
    </div>
  );
}
