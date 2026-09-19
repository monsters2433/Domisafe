export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  items?: string[];
}

interface LegalLayoutProps {
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
}

export function LegalLayout({ title, updatedAt, intro, sections }: LegalLayoutProps) {
  return (
    <div className="container-page py-16">
      <article className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 text-sm" style={{ color: 'var(--fg-subtle)' }}>
          Última actualización:{' '}
          <time dateTime={updatedAt}>
            {new Date(updatedAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
          </time>
        </p>
        <p className="mt-6 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
          {intro}
        </p>

        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mt-11 text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-4 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                {paragraph}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-4 space-y-2.5">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed" style={{ color: 'var(--fg-muted)' }}>
                    <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </article>
    </div>
  );
}
