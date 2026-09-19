'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'domisafe-consent';

export type ConsentValue = 'granted' | 'denied';

function readConsent(): ConsentValue | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'granted' || stored === 'denied' ? stored : null;
  } catch {
    return null;
  }
}

export function getStoredConsent(): ConsentValue | null {
  if (typeof window === 'undefined') return null;
  return readConsent();
}

/**
 * Consentimiento GDPR. La publicidad personalizada no se carga hasta que el
 * usuario acepta: AdSense solo se inicializa al emitirse 'domisafe-consent'
 * con valor 'granted' (ver AdSlot).
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readConsent() === null) setVisible(true);
  }, []);

  function decide(value: ConsentValue) {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Sin almacenamiento el banner reaparecerá; es aceptable y no rompe nada.
    }
    window.dispatchEvent(new CustomEvent<ConsentValue>('domisafe-consent', { detail: value }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentimiento de cookies"
      className="animate-rise fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-xl border p-5 shadow-[var(--shadow-lg)] sm:inset-x-6"
      style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border-strong)' }}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          Usamos cookies técnicas necesarias para que el sitio funcione y, con tu permiso, cookies de publicidad para
          mantenerlo gratuito. Puedes cambiar de opinión cuando quieras.{' '}
          <Link href="/legal/cookies" className="underline underline-offset-2" style={{ color: 'var(--fg)' }}>
            Más información
          </Link>
          .
        </p>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => decide('denied')}
            className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-inset)]"
            style={{ borderColor: 'var(--border-strong)' }}
          >
            Solo necesarias
          </button>
          <button
            type="button"
            onClick={() => decide('granted')}
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Aceptar todas
          </button>
        </div>
      </div>
    </div>
  );
}
