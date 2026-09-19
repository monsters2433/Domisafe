import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-page py-28">
      <div className="mx-auto max-w-md text-center">
        <p className="font-mono text-sm" style={{ color: 'var(--accent)' }}>
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Esta página no existe</h1>
        <p className="mt-4 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          Puede que el enlace esté mal o que el contenido se haya movido.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
