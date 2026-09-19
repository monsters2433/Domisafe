import Link from 'next/link';

import { AdSlot } from '@/components/AdSlot';
import { ScanForm } from '@/components/ScanForm';
import { getPosts } from '@/lib/posts';
import { CATEGORY_META, type CheckCategory } from '@/lib/types';

const CHECK_ORDER: CheckCategory[] = ['tls', 'headers', 'dns', 'whois', 'blocklists', 'reputation', 'exposure', 'breaches'];

const STEPS = [
  {
    title: 'Escribe el dominio',
    body: 'Sin registro ni datos personales. Solo el nombre del dominio que quieres revisar.',
  },
  {
    title: 'Consultamos fuentes públicas',
    body: 'Certificados, DNS, registros públicos y bases de datos de reputación. Nunca atacamos ni escaneamos el dominio.',
  },
  {
    title: 'Recibes un informe claro',
    body: 'Una nota global y el detalle de cada comprobación, con la recomendación concreta para arreglar lo que falle.',
  },
];

export default function HomePage() {
  const posts = getPosts().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="grid-backdrop absolute inset-0 -z-10" />

        <div className="container-page py-20 sm:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <span
              className="animate-fade inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium"
              style={{ borderColor: 'var(--border-strong)', color: 'var(--fg-muted)' }}
            >
              <span className="size-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
              Análisis pasivo · Sin escaneos intrusivos
            </span>

            <h1 className="animate-rise mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Comprueba la seguridad de tu dominio en segundos
            </h1>

            <p
              className="animate-rise mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed"
              style={{ color: 'var(--fg-muted)', animationDelay: '80ms' }}
            >
              Certificado SSL, cabeceras HTTP, SPF, DKIM, DMARC, listas negras y reputación. Un informe completo y
              gratuito, con instrucciones claras para corregir lo que esté mal.
            </p>

            <div id="analizar" className="animate-rise mx-auto mt-10 max-w-2xl scroll-mt-24" style={{ animationDelay: '160ms' }}>
              <ScanForm />
            </div>
          </div>
        </div>
      </section>

      {/* Qué comprobamos */}
      <section id="checks" className="container-page scroll-mt-24 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Qué comprobamos</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Ocho familias de comprobaciones, todas a partir de información pública y accesible para cualquiera.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHECK_ORDER.map((category, index) => (
            <article
              key={category}
              className="surface animate-rise p-5 transition-colors hover:border-[var(--border-strong)]"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <h3 className="font-medium">{CATEGORY_META[category].label}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {CATEGORY_META[category].description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="container-page">
        <AdSlot slot="0000000000" label="home-mid" className="my-4" />
      </div>

      {/* Cómo funciona */}
      <section id="como-funciona" className="container-page scroll-mt-24 py-16">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">Cómo funciona</h2>
          <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
            Tres pasos, ningún dato personal y ninguna acción intrusiva contra el dominio analizado.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="surface animate-rise p-6" style={{ animationDelay: `${index * 80}ms` }}>
              <span
                className="grid size-8 place-items-center rounded-lg text-sm font-semibold"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Nivel 2 */}
      <section className="container-page py-16">
        <div className="surface overflow-hidden p-8 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
                Análisis avanzado
              </span>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">¿Es tuyo el dominio? Puedes ir más lejos</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                Verificando la propiedad con un registro TXT en el DNS —igual que en Google Search Console— desbloqueas
                comprobaciones activas: escaneo de puertos propio, detección de versiones de servicios y búsqueda de
                vulnerabilidades conocidas (CVE).
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed" style={{ color: 'var(--fg-subtle)' }}>
                Estas comprobaciones nunca se ejecutan contra un dominio sin verificar. Es una línea que no cruzamos:
                escanear activamente infraestructura ajena sin permiso no es legítimo.
              </p>
            </div>

            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--bg-inset)' }}>
              <p className="text-sm font-medium">Próximamente</p>
              <ul className="mt-4 space-y-3 text-sm" style={{ color: 'var(--fg-muted)' }}>
                {['Verificación por registro TXT o meta tag', 'Escaneo de puertos autorizado', 'Detección de servicios y versiones', 'Contraste con CVE conocidas'].map(
                  (item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.4" className="mt-0.5 size-4 shrink-0">
                        <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guías */}
      <section className="container-page py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight">Guías de seguridad</h2>
            <p className="mt-3 text-base leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
              Explicaciones prácticas para entender el informe y arreglar lo que salga en rojo.
            </p>
          </div>
          <Link href="/blog" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
            Ver todas →
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="surface animate-rise p-6 transition-colors hover:border-[var(--border-strong)]"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--accent)' }}>
                {post.category}
              </p>
              <h3 className="mt-2.5 font-medium leading-snug">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {post.excerpt}
              </p>
              <p className="mt-4 text-xs" style={{ color: 'var(--fg-subtle)' }}>
                {post.readingMinutes} min de lectura
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
