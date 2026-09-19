import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { AdSlot } from '@/components/AdSlot';
import { siteConfig } from '@/lib/config';
import { getPost, getPosts, type Block } from '@/lib/posts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) return { title: 'Guía no encontrada' };

  return {
    title: post.metaTitle,
    description: post.excerpt,
    keywords: post.keywords,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.metaTitle,
      description: post.excerpt,
      url: `${siteConfig.url}/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: { card: 'summary_large_image', title: post.metaTitle, description: post.excerpt },
  };
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 key={index} className="mt-12 text-2xl font-semibold tracking-tight">
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 key={index} className="mt-8 text-lg font-medium">
          {block.text}
        </h3>
      );
    case 'p':
      return (
        <p key={index} className="mt-5 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          {block.text}
        </p>
      );
    case 'ul':
      return (
        <ul key={index} className="mt-5 space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre
          key={index}
          className="mt-5 overflow-x-auto rounded-xl border p-4 font-mono text-sm leading-relaxed"
          style={{ backgroundColor: 'var(--bg-inset)', borderColor: 'var(--border)' }}
        >
          <code>{block.text}</code>
        </pre>
      );
    case 'note':
      return (
        <aside
          key={index}
          className="mt-6 rounded-xl border-l-2 py-4 pl-5 pr-4 text-sm leading-relaxed"
          style={{ borderColor: 'var(--accent)', backgroundColor: 'var(--bg-inset)', color: 'var(--fg-muted)' }}
        >
          {block.text}
        </aside>
      );
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: 'es-ES',
    author: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteConfig.url}/blog/${post.slug}` },
  };

  return (
    <article className="container-page py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="mx-auto max-w-3xl">
        <Link href="/blog" className="text-sm" style={{ color: 'var(--fg-muted)' }}>
          ← Todas las guías
        </Link>

        <header className="mt-6">
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
            {post.category}
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight tracking-tight">{post.title}</h1>
          <p className="mt-4 text-sm" style={{ color: 'var(--fg-subtle)' }}>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </time>
            {' · '}
            {post.readingMinutes} min de lectura
          </p>
        </header>

        <div className="mt-10">{post.blocks.map(renderBlock)}</div>

        <AdSlot slot="0000000000" label="article-end" className="mt-14" />

        <div className="surface mt-10 p-7 text-center">
          <h2 className="text-xl font-semibold tracking-tight">Comprueba tu dominio ahora</h2>
          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Informe gratuito con certificado SSL, cabeceras HTTP, SPF, DKIM, DMARC y reputación.
          </p>
          <Link
            href="/#analizar"
            className="mt-5 inline-block rounded-lg px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Analizar un dominio
          </Link>
        </div>
      </div>
    </article>
  );
}
