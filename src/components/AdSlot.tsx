'use client';

import { useEffect, useState } from 'react';

import { adsenseConfig } from '@/lib/config';

import { getStoredConsent, type ConsentValue } from './CookieBanner';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let scriptInjected = false;

function injectAdsenseScript(client: string): void {
  if (scriptInjected) return;
  scriptInjected = true;

  const script = document.createElement('script');
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
  script.async = true;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

interface AdSlotProps {
  slot: string;
  /** Etiqueta interna para identificar la ubicación en el layout. */
  label: string;
  format?: string;
  className?: string;
}

/**
 * Hueco de publicidad preparado para Google AdSense.
 *
 * Hasta que la cuenta esté aprobada (NEXT_PUBLIC_ADSENSE_ENABLED=false) se
 * reserva el espacio con un marcador. Así el layout ya está dimensionado y
 * activar los anuncios después no provoca saltos de contenido (CLS).
 *
 * El script de Google NO se carga sin consentimiento explícito del usuario.
 */
export function AdSlot({ slot, label, format = 'auto', className = '' }: AdSlotProps) {
  const [consent, setConsent] = useState<ConsentValue | null>(null);

  useEffect(() => {
    setConsent(getStoredConsent());

    function onConsent(event: Event) {
      setConsent((event as CustomEvent<ConsentValue>).detail);
    }

    window.addEventListener('domisafe-consent', onConsent);
    return () => window.removeEventListener('domisafe-consent', onConsent);
  }, []);

  const active = adsenseConfig.enabled && adsenseConfig.client !== '' && consent === 'granted';

  useEffect(() => {
    if (!active) return;
    injectAdsenseScript(adsenseConfig.client);
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // Bloqueador de anuncios: el hueco simplemente se queda vacío.
    }
  }, [active]);

  if (!active) {
    return (
      <div
        aria-hidden="true"
        data-ad-placeholder={label}
        className={`grid min-h-[96px] place-items-center rounded-xl border border-dashed text-xs ${className}`}
        style={{ borderColor: 'var(--border)', color: 'var(--fg-subtle)' }}
      >
        Espacio publicitario
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle block"
        style={{ display: 'block' }}
        data-ad-client={adsenseConfig.client}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
