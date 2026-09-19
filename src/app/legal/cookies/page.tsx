import type { Metadata } from 'next';

import { LegalLayout } from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Política de cookies',
  description: 'Qué cookies y almacenamiento local usa Domisafe, para qué sirven y cómo cambiar tu decisión.',
  alternates: { canonical: '/legal/cookies' },
  robots: { index: true, follow: true },
};

export default function CookiesPage() {
  return (
    <LegalLayout
      title="Política de cookies"
      updatedAt="2026-02-10"
      intro="Domisafe usa el mínimo de cookies posible. Las técnicas son imprescindibles para que el sitio funcione; las publicitarias solo se activan si das tu consentimiento expreso."
      sections={[
        {
          heading: '1. Qué es una cookie',
          paragraphs: [
            'Una cookie es un pequeño fichero que un sitio web guarda en tu navegador. Junto a ellas usamos también el almacenamiento local (localStorage), que funciona de forma parecida pero no se envía al servidor en cada petición.',
          ],
        },
        {
          heading: '2. Cookies y almacenamiento técnico (necesarios)',
          paragraphs: ['No requieren consentimiento porque sin ellos el servicio no puede prestarse:'],
          items: [
            'domisafe-theme (localStorage): recuerda si prefieres el tema claro u oscuro. No caduca. No sale de tu navegador.',
            'domisafe-consent (localStorage): guarda tu decisión sobre las cookies para no volver a preguntarte. No caduca. No sale de tu navegador.',
            'Cookies de Cloudflare: necesarias para la protección frente a ataques y para el funcionamiento del sistema anti-bots Turnstile del formulario de análisis.',
          ],
        },
        {
          heading: '3. Cookies publicitarias (requieren consentimiento)',
          paragraphs: [
            'Si aceptas, cargamos Google AdSense, que puede instalar cookies para mostrar anuncios, medir su rendimiento y limitar el número de veces que ves el mismo.',
            'Estas cookies son de terceros: Google las gestiona como responsable independiente, conforme a sus propias políticas. Si eliges "Solo necesarias", el script publicitario no se carga en ningún momento.',
          ],
        },
        {
          heading: '4. Cómo cambiar tu decisión',
          paragraphs: [
            'Puedes revocar o modificar tu consentimiento en cualquier momento borrando los datos de sitio de domisafe.org desde la configuración de tu navegador: al volver a entrar, aparecerá de nuevo el aviso de cookies.',
            'También puedes bloquear o eliminar cookies desde las preferencias de tu navegador. Ten en cuenta que bloquear las cookies técnicas puede impedir que el formulario de análisis funcione.',
          ],
        },
        {
          heading: '5. Más información',
          paragraphs: [
            'Para conocer el resto de tratamientos de datos, consulta nuestra política de privacidad. Para cualquier duda sobre esta política, escribe a privacidad@domisafe.org.',
          ],
        },
      ]}
    />
  );
}
