import type { Metadata } from 'next';

import { LegalLayout } from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Condiciones de uso del servicio de análisis de seguridad de dominios de Domisafe.',
  alternates: { canonical: '/legal/terminos' },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Términos de uso"
      updatedAt="2026-02-10"
      intro="Al utilizar Domisafe aceptas estas condiciones. Si no estás de acuerdo con alguna de ellas, no uses el servicio."
      sections={[
        {
          heading: '1. Objeto del servicio',
          paragraphs: [
            'Domisafe ofrece un análisis informativo de la configuración de seguridad de dominios de internet, elaborado a partir de información pública y de bases de datos de terceros.',
            'El servicio se presta gratuitamente y sin necesidad de registro para las comprobaciones de nivel básico.',
          ],
        },
        {
          heading: '2. Naturaleza de los análisis',
          paragraphs: [
            'Las comprobaciones del nivel básico son pasivas: se consultan registros DNS, certificados publicados, bases de datos de reputación y otras fuentes de acceso público. No se realiza ninguna acción intrusiva contra el dominio analizado.',
            'Las comprobaciones activas del nivel avanzado —como el escaneo de puertos— requieren que el usuario acredite previamente la propiedad del dominio mediante un registro DNS o una etiqueta en el sitio web. Sin esa verificación no se ejecutan bajo ninguna circunstancia.',
          ],
        },
        {
          heading: '3. Uso aceptable',
          paragraphs: ['Al usar Domisafe te comprometes a no:'],
          items: [
            'Utilizar el servicio para preparar o facilitar ataques contra sistemas ajenos.',
            'Solicitar comprobaciones avanzadas sobre dominios que no te pertenecen ni gestionas.',
            'Realizar consultas automatizadas masivas, eludir los límites de uso o la verificación anti-bots.',
            'Intentar acceder a partes del servicio no destinadas al público, ni interferir en su funcionamiento.',
          ],

        },
        {
          heading: '4. Verificación de propiedad',
          paragraphs: [
            'Al verificar un dominio declaras ser su titular o estar autorizado por este. Conservamos un registro de las verificaciones realizadas —dominio, método, fecha y dirección IP— con fines de seguridad y trazabilidad.',
            'La verificación fraudulenta de un dominio ajeno puede constituir una infracción legal y conllevará la suspensión inmediata del acceso.',
          ],
        },
        {
          heading: '5. Exactitud de la información y exención de responsabilidad',
          paragraphs: [
            'Los informes se generan automáticamente y pueden contener errores, quedar desactualizados o depender de fuentes de terceros que no controlamos. La puntuación es orientativa y no constituye una auditoría de seguridad ni un asesoramiento profesional.',
            'El servicio se presta "tal cual", sin garantías de disponibilidad, exactitud o adecuación a un fin concreto. No nos hacemos responsables de las decisiones que tomes a partir de la información mostrada ni de los daños derivados del uso o la imposibilidad de uso del servicio.',
          ],
        },
        {
          heading: '6. Disponibilidad',
          paragraphs: [
            'El servicio puede interrumpirse por mantenimiento, incidencias técnicas o limitaciones de las APIs de terceros. Podemos modificar, limitar o suspender funcionalidades en cualquier momento.',
          ],
        },
        {
          heading: '7. Propiedad intelectual',
          paragraphs: [
            'El diseño, los textos y el software de Domisafe son propiedad de su titular. Puedes usar libremente los informes que generes, incluyendo compartirlos o citarlos indicando la fuente.',
          ],
        },
        {
          heading: '8. Legislación aplicable',
          paragraphs: [
            'Estas condiciones se rigen por la legislación española. Para cualquier controversia, las partes se someten a los juzgados y tribunales que correspondan conforme a la normativa vigente en materia de consumidores.',
          ],
        },
      ]}
    />
  );
}
