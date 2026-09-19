import Link from 'next/link';

import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';

const links = [
  { href: '/#como-funciona', label: 'Cómo funciona' },
  { href: '/#checks', label: 'Análisis' },
  { href: '/blog', label: 'Guías' },
];

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur-lg"
      style={{ borderColor: 'var(--border)', backgroundColor: 'color-mix(in srgb, var(--bg) 82%, transparent)' }}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <Logo />
          <span className="text-[17px]">Domisafe</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--bg-inset)]"
              style={{ color: 'var(--fg-muted)' }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/#analizar"
            className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Analizar
          </Link>
        </div>
      </div>
    </header>
  );
}
