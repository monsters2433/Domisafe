import { STATUS_META, type CheckStatus } from '@/lib/types';

const TONE_VARS: Record<string, { fg: string; bg: string }> = {
  pass: { fg: 'var(--pass)', bg: 'var(--pass-bg)' },
  warn: { fg: 'var(--warn)', bg: 'var(--warn-bg)' },
  fail: { fg: 'var(--fail)', bg: 'var(--fail-bg)' },
  info: { fg: 'var(--info)', bg: 'var(--info-bg)' },
};

export function statusTone(status: CheckStatus): { fg: string; bg: string } {
  return TONE_VARS[STATUS_META[status].tone] ?? TONE_VARS.info;
}

export function StatusPill({ status }: { status: CheckStatus }) {
  const tone = statusTone(status);

  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: tone.bg, color: tone.fg }}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full" style={{ backgroundColor: tone.fg }} />
      {STATUS_META[status].label}
    </span>
  );
}

/** Punto de color para las listas de detalle. Decorativo: el texto ya da el dato. */
export function StatusDot({ status }: { status?: CheckStatus }) {
  if (!status) return <span className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />;
  return <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full" style={{ backgroundColor: statusTone(status).fg }} />;
}
