import Link from 'next/link';

import { Logo } from './Logo';

const columns = [
  {
    title: 'Producto',
    links: [
      { href: '/#analizar', label: 'Analizar un dominio' },
      { href: '/#checks', label: 'Qué comprobamos' },
      { href: '/#como-funciona', label: 'Cómo funciona' },
    ],
  },
  {
    title: 'Guías',
    links: [
      { href: '/blog', label: 'Todas las guías' },
      { href: '/blog/spf-dkim-dmarc', label: 'SPF, DKIM y DMARC' },
      { href: '/blog/cabeceras-seguridad-http', label: 'Cabeceras de seguridad' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/legal/privacidad', label: 'Privacidad' },
      { href: '/legal/terminos', label: 'Términos de uso' },
      { href: '/legal/cookies', label: 'Cookies' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-subtle)' }}>
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-2.5 font-semibold tracking-tight">
              <Logo />
              <span>Domisafe</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              Análisis de seguridad de dominios con datos públicos. Sin escaneos intrusivos y sin registro.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold">{column.title}</h3>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition-colors hover:text-[var(--fg)]" style={{ color: 'var(--fg-muted)' }}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between"
          style={{ borderColor: 'var(--border)', color: 'var(--fg-subtle)' }}
        >
          <p>© {new Date().getFullYear()} Domisafe. Todos los análisis usan exclusivamente fuentes públicas.</p>
          <p>Hecho con cuidado por la privacidad.</p>
        </div>
      </div>
    </footer>
  );
}
