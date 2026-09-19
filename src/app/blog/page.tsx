import type { Metadata } from 'next';
import Link from 'next/link';

import { getPosts } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Guías de seguridad de dominios',
  description:
    'Guías prácticas sobre certificados SSL, cabeceras de seguridad HTTP, SPF, DKIM, DMARC y protección de dominios. Explicadas en claro y con ejemplos.',
  alternates: { canonical: '/blog' },
};

export default function BlogIndexPage() {
  const posts = getPosts();

  return (
    <div className="container-page py-16">
      <header className="max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">Guías de seguridad</h1>
        <p className="mt-4 text-lg leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          Explicaciones prácticas para entender tu informe y arreglar lo que salga en rojo. Sin jerga innecesaria y con
          ejemplos que puedes copiar.
        </p>
      </header>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <article key={post.slug} className="surface animate-rise flex flex-col p-6" style={{ animationDelay: `${index * 70}ms` }}>
            <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
              {post.category}
            </p>
            <h2 className="mt-2.5 text-lg font-medium leading-snug">
              <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-[var(--accent)]">
                {post.title}
              </Link>
            </h2>
            <p className="mt-3 flex-1 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              {post.excerpt}
            </p>
            <p className="mt-5 text-xs" style={{ color: 'var(--fg-subtle)' }}>
              <time dateTime={post.publishedAt}>
                {new Date(post.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              {' · '}
              {post.readingMinutes} min
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
