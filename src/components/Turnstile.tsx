'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('turnstile-script'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

interface TurnstileProps {
  siteKey: string;
  theme: 'auto' | 'light' | 'dark';
  onToken: (token: string) => void;
  onExpire: () => void;
}

/**
 * Widget de Cloudflare Turnstile en modo explícito.
 *
 * El script solo se carga cuando este componente se monta, de modo que la
 * landing no arrastra JS de terceros en la carga inicial (Core Web Vitals).
 */
export function Turnstile({ siteKey, theme, onToken, onExpire }: TurnstileProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const handlers = useRef({ onToken, onExpire });

  handlers.current = { onToken, onExpire };

  useEffect(() => {
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId.current = window.turnstile.render(container.current, {
          sitekey: siteKey,
          theme,
          size: 'flexible',
          language: 'es',
          callback: (token: string) => handlers.current.onToken(token),
          'expired-callback': () => handlers.current.onExpire(),
          'error-callback': () => handlers.current.onExpire(),
        });
      })
      .catch(() => {
        // Sin script no hay token: el backend rechazará la petición, que es el
        // comportamiento correcto (no se abre el paso ante un fallo).
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [siteKey, theme]);

  return <div ref={container} className="min-h-[65px]" />;
}
