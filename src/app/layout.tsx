import type { Metadata, Viewport } from 'next';

import { CookieBanner } from '@/components/CookieBanner';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { siteConfig } from '@/lib/config';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline} gratis`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'verificar seguridad dominio',
    'comprobar SSL gratis',
    'SPF DKIM DMARC checker',
    'analizar dominio',
    'cabeceras de seguridad HTTP',
    'listas negras dominio',
  ],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name, url: siteConfig.url }],
  creator: siteConfig.name,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline} gratis`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitter,
    title: `${siteConfig.name} — ${siteConfig.tagline} gratis`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#08090b' },
  ],
  width: 'device-width',
  initialScale: 1,
};

/**
 * Fija data-theme antes del primer pintado. Va inline a propósito: si esperase
 * a la hidratación habría un parpadeo de tema y penalizaría en CLS.
 */
const THEME_SCRIPT = `(function(){try{var s=localStorage.getItem('domisafe-theme');var t=s||(window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;

const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: siteConfig.name,
  url: siteConfig.url,
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  description: siteConfig.description,
  inLanguage: 'es-ES',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  featureList: [
    'Análisis de certificado SSL/TLS',
    'Cabeceras de seguridad HTTP',
    'Verificación de SPF, DKIM y DMARC',
    'Consulta de listas negras de spam',
    'Reputación de IP',
    'Subdominios expuestos',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
      </head>
      <body className="min-h-dvh">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }} />
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="contenido">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
