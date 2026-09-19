'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { parseDomain } from '@/lib/domain';

import { Turnstile } from './Turnstile';

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';

interface ScanFormProps {
  initialDomain?: string;
  autoFocus?: boolean;
}

export function ScanForm({ initialDomain = '', autoFocus = false }: ScanFormProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialDomain);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (pending) return;

    const parsed = parseDomain(value);
    if (!parsed.ok) {
      setError(parsed.error ?? 'Dominio no válido.');
      return;
    }

    setError(null);
    setPending(true);

    try {
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: parsed.domain, turnstileToken: token }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error ?? 'No se pudo completar el análisis.');
        setPending(false);
        return;
      }

      router.push(`/scan/${encodeURIComponent(parsed.domain)}`);
    } catch {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--fg-subtle)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-5">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18Z" />
            </svg>
          </span>
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            autoFocus={autoFocus}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="ejemplo.com"
            aria-label="Dominio a analizar"
            aria-invalid={error ? true : undefined}
            className="h-14 w-full rounded-xl border pl-12 pr-4 text-base outline-none transition-colors focus:border-[var(--accent)]"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)', color: 'var(--fg)' }}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="h-14 rounded-xl px-7 text-base font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          {pending ? 'Analizando…' : 'Analizar gratis'}
        </button>
      </div>

      {SITE_KEY ? (
        <div className="mt-4 max-w-sm">
          <Turnstile siteKey={SITE_KEY} theme="auto" onToken={setToken} onExpire={() => setToken('')} />
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="animate-fade mt-3 text-sm" style={{ color: 'var(--fail)' }}>
          {error}
        </p>
      ) : (
        <p className="mt-3 text-sm" style={{ color: 'var(--fg-subtle)' }}>
          Gratis, sin registro. Solo consultamos información pública del dominio.
        </p>
      )}
    </form>
  );
}
