import { CATEGORY_META, type CheckResult } from '@/lib/types';

import { StatusDot, StatusPill, statusTone } from './StatusPill';

export function CheckCard({ check, index }: { check: CheckResult; index: number }) {
  const tone = statusTone(check.status);

  return (
    <details
      className="surface animate-rise group overflow-hidden"
      style={{ animationDelay: `${Math.min(index * 60, 420)}ms` }}
      open={check.status === 'fail'}
    >
      <summary className="flex cursor-pointer list-none items-start gap-4 p-5 transition-colors hover:bg-[var(--bg-inset)]">
        <span aria-hidden="true" className="mt-1 grid size-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: tone.bg }}>
          <span className="size-2.5 rounded-full" style={{ backgroundColor: tone.fg }} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <span className="font-medium">{check.title}</span>
            <StatusPill status={check.status} />
          </span>
          <span className="mt-1.5 block text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            {check.summary}
          </span>
        </span>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="mt-2.5 size-4 shrink-0 transition-transform group-open:rotate-180"
          style={{ color: 'var(--fg-subtle)' }}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="border-t px-5 pb-5 pt-4" style={{ borderColor: 'var(--border)' }}>
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {check.details.map((detail) => (
            <div key={detail.label} className="flex items-start gap-2.5">
              <span className="mt-1.5">
                <StatusDot status={detail.status} />
              </span>
              <div className="min-w-0">
                <dt className="text-xs uppercase tracking-wide" style={{ color: 'var(--fg-subtle)' }}>
                  {detail.label}
                </dt>
                <dd className="mt-0.5 break-words font-mono text-sm">{detail.value}</dd>
              </div>
            </div>
          ))}
        </dl>

        {check.recommendation ? (
          <div className="mt-5 rounded-lg border-l-2 py-2.5 pl-4 pr-3 text-sm leading-relaxed" style={{ borderColor: tone.fg, backgroundColor: 'var(--bg-inset)' }}>
            <span className="font-medium">Recomendación: </span>
            <span style={{ color: 'var(--fg-muted)' }}>{check.recommendation}</span>
          </div>
        ) : null}

        <p className="mt-4 text-xs" style={{ color: 'var(--fg-subtle)' }}>
          {CATEGORY_META[check.category].label} · Fuente: {check.source}
        </p>
      </div>
    </details>
  );
}
