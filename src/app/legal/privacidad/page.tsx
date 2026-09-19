import type { Metadata } from 'next';

import { LegalLayout } from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Qué datos trata Domisafe, con qué base legal, durante cuánto tiempo y cómo ejercer tus derechos.',
  alternates: { canonical: '/legal/privacidad' },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Política de privacidad"
      updatedAt="2026-02-10"
      intro="Esta política explica qué información trata Domisafe cuando usas el servicio, con qué finalidad y qué derechos tienes sobre ella. Está redactada conforme al Reglamento (UE) 2016/679 (RGPD) y a la LOPDGDD."
      sections={[
        {
          heading: '1. Responsable del tratamiento',
          paragraphs: [
            'Responsable: [NOMBRE O RAZÓN SOCIAL]. NIF: [NIF]. Domicilio: [DIRECCIÓN]. Correo de contacto: privacidad@domisafe.org.',
            'Puedes dirigirte a esa dirección para cualquier cuestión relacionada con el tratamiento de tus datos.',
          ],
        },
        {
          heading: '2. Qué datos tratamos',
          paragraphs: ['Domisafe funciona sin cuentas de usuario. Los datos que se tratan son los mínimos para prestar y proteger el servicio:'],
          items: [
            'Dominios consultados: el nombre del dominio que introduces en el formulario. Es información pública y no se asocia a tu identidad.',
            'Dirección IP: se usa de forma temporal para aplicar límites de uso y prevenir abusos. No se almacena vinculada a los dominios consultados.',
            'Datos técnicos de navegación: tipo de navegador, idioma y páginas visitadas, en registros del servidor con retención limitada.',
            'Preferencias locales: el tema claro u oscuro y tu decisión sobre cookies se guardan en tu navegador y nunca se envían a nuestros servidores.',
          ],
        },
        {
          heading: '3. Finalidad y base legal',
          items: [
            'Prestar el servicio de análisis solicitado. Base legal: ejecución de la relación a petición del interesado (art. 6.1.b RGPD).',
            'Proteger la infraestructura frente a abusos mediante límites de uso y verificación anti-bots. Base legal: interés legítimo (art. 6.1.f RGPD).',
            'Mostrar publicidad y medir su rendimiento. Base legal: tu consentimiento (art. 6.1.a RGPD), revocable en cualquier momento.',
          ],
        },
        {
          heading: '4. Plazos de conservación',
          items: [
            'Resultados de análisis: se guardan en caché unas horas para no repetir consultas innecesarias, y después se eliminan.',
            'Registros de seguridad y direcciones IP: un máximo de 30 días.',
            'Registros de verificación de propiedad de dominios: mientras la verificación siga activa, por motivos de trazabilidad y seguridad.',
          ],
        },
        {
          heading: '5. Destinatarios y transferencias',
          paragraphs: [
            'Para elaborar el informe consultamos bases de datos y APIs públicas de terceros (entre otras, servicios de reputación de IP y de inteligencia sobre amenazas). A esos proveedores se les transmite únicamente el dominio o la dirección IP analizados, nunca información sobre ti.',
            'Utilizamos Cloudflare como proveedor de red y protección frente a ataques, que trata direcciones IP como encargado del tratamiento.',
            'Si aceptas las cookies publicitarias, Google actuará como responsable independiente respecto de los datos que recoja con esa finalidad. Algunos de estos proveedores están ubicados fuera del Espacio Económico Europeo; en esos casos las transferencias se amparan en las cláusulas contractuales tipo de la Comisión Europea.',
          ],
        },
        {
          heading: '6. Tus derechos',
          paragraphs: [
            'Puedes solicitar el acceso, rectificación, supresión, limitación, portabilidad u oposición al tratamiento escribiendo a privacidad@domisafe.org.',
            'Si consideras que no hemos atendido correctamente tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es).',
          ],
        },
        {
          heading: '7. Seguridad',
          paragraphs: [
            'Aplicamos cifrado en tránsito, limitación de acceso a la infraestructura, límites de uso y minimización de los datos tratados. Ningún sistema es infalible, pero el diseño del servicio evita recoger datos personales que no sean imprescindibles.',
          ],
        },
        {
          heading: '8. Cambios en esta política',
          paragraphs: [
            'Si modificamos esta política publicaremos la nueva versión en esta misma página, actualizando la fecha que figura arriba.',
          ],
        },
      ]}
    />
  );
}
