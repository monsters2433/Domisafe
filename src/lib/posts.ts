export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code'; text: string }
  | { type: 'note'; text: string };

export interface Post {
  slug: string;
  title: string;
  /** Título para <title> y resultados de búsqueda; puede diferir del H1. */
  metaTitle: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  keywords: string[];
  blocks: Block[];
}

const posts: Post[] = [
  {
    slug: 'spf-dkim-dmarc',
    title: 'SPF, DKIM y DMARC explicados: cómo evitar que suplanten tu dominio',
    metaTitle: 'SPF, DKIM y DMARC: guía práctica y checker gratis',
    excerpt:
      'Qué hace cada registro, en qué orden configurarlos y cómo llegar a una política DMARC estricta sin perder correo por el camino.',
    category: 'Correo',
    publishedAt: '2026-01-14',
    updatedAt: '2026-01-14',
    readingMinutes: 8,
    keywords: ['SPF DKIM DMARC checker', 'configurar DMARC', 'evitar suplantación de correo'],
    blocks: [
      {
        type: 'p',
        text: 'Si tu dominio no tiene SPF, DKIM y DMARC bien configurados, cualquiera puede enviar correo haciéndose pasar por ti. No hace falta acceso a tu servidor ni a tu cuenta: basta con poner tu dominio en el remitente. Estos tres registros DNS son la defensa estándar contra eso.',
      },
      { type: 'h2', text: 'Los tres registros, en una frase cada uno' },
      {
        type: 'ul',
        items: [
          'SPF dice qué servidores tienen permiso para enviar correo en nombre de tu dominio.',
          'DKIM firma criptográficamente cada mensaje, de modo que el destinatario comprueba que no se ha manipulado.',
          'DMARC indica qué hacer cuando SPF o DKIM fallan, y te envía informes de quién intenta suplantarte.',
        ],
      },
      {
        type: 'p',
        text: 'Son complementarios: SPF y DKIM verifican, DMARC decide y reporta. Sin DMARC, los otros dos son recomendaciones que el destinatario puede ignorar.',
      },
      { type: 'h2', text: 'SPF: la lista de remitentes autorizados' },
      {
        type: 'p',
        text: 'Es un registro TXT en la raíz del dominio. Enumera los servidores autorizados y termina con un mecanismo que indica qué hacer con el resto.',
      },
      { type: 'code', text: 'v=spf1 include:_spf.google.com include:sendgrid.net ~all' },
      {
        type: 'ul',
        items: [
          '~all (softfail): el correo no autorizado se marca como sospechoso. Es el punto de partida recomendado.',
          '-all (hardfail): se rechaza directamente. El objetivo final, cuando estés seguro de la lista.',
          '+all: autoriza a cualquiera. Nunca lo uses: equivale a no tener SPF.',
        ],
      },
      {
        type: 'note',
        text: 'Límite importante: SPF permite un máximo de 10 consultas DNS. Cada "include" cuenta, y los includes anidados también. Si te pasas, SPF falla entero (permerror) y dejas de estar protegido sin darte cuenta.',
      },
      { type: 'h2', text: 'DKIM: la firma que viaja con el mensaje' },
      {
        type: 'p',
        text: 'Tu servidor de correo firma cada mensaje con una clave privada y publica la pública en un registro TXT bajo un selector. El destinatario recupera esa clave y verifica la firma.',
      },
      { type: 'code', text: 'selector._domainkey.tudominio.com   TXT   "v=DKIM1; k=rsa; p=MIIBIjANBg..."' },
      {
        type: 'p',
        text: 'El nombre del selector lo elige tu proveedor (Google usa "google", Microsoft "selector1" y "selector2"). A diferencia de SPF, DKIM sobrevive al reenvío del mensaje, y por eso es la pata más fiable de las tres.',
      },
      { type: 'h2', text: 'DMARC: la política y los informes' },
      { type: 'code', text: 'v=DMARC1; p=none; rua=mailto:dmarc@tudominio.com; pct=100; adkim=r; aspf=r' },
      {
        type: 'ul',
        items: [
          'p=none: no hagas nada, solo infórmame. Fase de observación.',
          'p=quarantine: manda el correo fallido a spam.',
          'p=reject: recházalo directamente. El objetivo.',
          'rua: dirección a la que se envían los informes agregados diarios.',
        ],
      },
      { type: 'h2', text: 'El orden correcto para llegar a p=reject' },
      {
        type: 'ul',
        items: [
          '1. Publica SPF con ~all y activa DKIM en todos tus proveedores de envío.',
          '2. Publica DMARC con p=none y una dirección rua. No rompe nada.',
          '3. Deja pasar entre dos y cuatro semanas y lee los informes. Descubrirás servicios legítimos que no conocías: facturación, CRM, formularios de la web.',
          '4. Corrige lo que falte hasta que todo el correo legítimo pase SPF o DKIM.',
          '5. Sube a p=quarantine. Espera otras dos semanas.',
          '6. Sube a p=reject.',
        ],
      },
      {
        type: 'note',
        text: 'No saltes directamente a p=reject. Casi siempre hay algún sistema enviando correo legítimo en tu nombre que nadie recuerda, y lo descubrirás cuando dejen de llegar las facturas.',
      },
      { type: 'h2', text: 'Cómo comprobar que está bien' },
      {
        type: 'p',
        text: 'Analiza tu dominio en Domisafe: verás los tres registros, si el SPF supera el límite de consultas DNS, qué política DMARC tienes publicada y si hay selectores DKIM detectables. Es gratis y no requiere registro.',
      },
    ],
  },
  {
    slug: 'cabeceras-seguridad-http',
    title: 'Cabeceras de seguridad HTTP: cuáles importan y cómo configurarlas',
    metaTitle: 'Cabeceras de seguridad HTTP: guía y comprobador gratis',
    excerpt:
      'HSTS, CSP, X-Frame-Options y compañía: qué ataque frena cada una, con ejemplos listos para Nginx y Apache.',
    category: 'Web',
    publishedAt: '2026-01-21',
    updatedAt: '2026-01-21',
    readingMinutes: 7,
    keywords: ['cabeceras seguridad HTTP', 'Content-Security-Policy', 'HSTS configurar'],
    blocks: [
      {
        type: 'p',
        text: 'Las cabeceras de seguridad son instrucciones que tu servidor envía al navegador para limitar lo que puede hacer una página. Se configuran en minutos, no requieren tocar el código de la aplicación y cierran categorías enteras de ataques.',
      },
      { type: 'h2', text: 'Strict-Transport-Security (HSTS)' },
      { type: 'code', text: 'Strict-Transport-Security: max-age=31536000; includeSubDomains; preload' },
      {
        type: 'p',
        text: 'Obliga al navegador a usar HTTPS durante el tiempo indicado, aunque el usuario escriba http:// o pinche un enlace antiguo. Cierra la ventana de ataque que existe entre la primera petición en claro y la redirección a HTTPS.',
      },
      {
        type: 'note',
        text: 'Cuidado con includeSubDomains y preload: si algún subdominio no tiene HTTPS, dejará de ser accesible. Y salir de la lista de preload tarda meses. Empieza con un max-age corto (por ejemplo 300) y súbelo cuando estés seguro.',
      },
      { type: 'h2', text: 'Content-Security-Policy (CSP)' },
      { type: 'code', text: "Content-Security-Policy: default-src 'self'; script-src 'self'; frame-ancestors 'none'; base-uri 'self'" },
      {
        type: 'p',
        text: 'Es la cabecera más potente y la más incómoda de configurar. Declara de dónde puede cargar recursos la página; todo lo demás se bloquea. Es la defensa real contra XSS: aunque alguien consiga inyectar un script, el navegador se niega a ejecutarlo.',
      },
      {
        type: 'p',
        text: 'Configúrala en dos fases. Primero despliega Content-Security-Policy-Report-Only con un endpoint de informes: no bloquea nada y te dice exactamente qué se rompería. Cuando los informes estén limpios, cambia el nombre de la cabecera.',
      },
      { type: 'h2', text: 'X-Frame-Options y frame-ancestors' },
      { type: 'code', text: 'X-Frame-Options: DENY' },
      {
        type: 'p',
        text: 'Impide que tu web se cargue dentro de un iframe ajeno, que es la base del clickjacking. La directiva frame-ancestors de CSP hace lo mismo con más precisión; mantén las dos mientras haya navegadores antiguos en tu tráfico.',
      },
      { type: 'h2', text: 'Las tres rápidas' },
      {
        type: 'ul',
        items: [
          'X-Content-Type-Options: nosniff — evita que el navegador adivine el tipo de un fichero y ejecute como script algo que no lo es.',
          'Referrer-Policy: strict-origin-when-cross-origin — deja de filtrar la URL completa (y sus parámetros) a sitios de terceros.',
          'Permissions-Policy: camera=(), microphone=(), geolocation=() — desactiva APIs del navegador que tu web no usa.',
        ],
      },
      { type: 'h2', text: 'Ejemplo para Nginx' },
      {
        type: 'code',
        text: `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;`,
      },
      {
        type: 'note',
        text: 'El modificador "always" no es opcional: sin él, Nginx omite la cabecera en las respuestas de error (404, 500), que son precisamente páginas donde también quieres protección.',
      },
      { type: 'h2', text: 'Ejemplo para Apache' },
      {
        type: 'code',
        text: `<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>`,
      },
      {
        type: 'p',
        text: 'Cuando termines, comprueba el resultado analizando tu dominio en Domisafe: te dirá cuáles faltan y cuáles están mal formadas.',
      },
    ],
  },
  {
    slug: 'comprobar-certificado-ssl',
    title: 'Cómo comprobar el certificado SSL de una web (y qué mirar exactamente)',
    metaTitle: 'Comprobar SSL gratis: qué revisar en un certificado',
    excerpt:
      'Más allá del candado: validez, cadena de confianza, algoritmos, versión de TLS y los fallos que más se repiten.',
    category: 'TLS',
    publishedAt: '2026-02-04',
    updatedAt: '2026-02-04',
    readingMinutes: 6,
    keywords: ['comprobar SSL gratis', 'verificar certificado dominio', 'caducidad certificado SSL'],
    blocks: [
      {
        type: 'p',
        text: 'El candado del navegador solo dice que la conexión va cifrada y que el certificado es válido hoy. No dice si caduca la semana que viene, si la cadena está incompleta para algunos clientes o si el servidor sigue aceptando protocolos obsoletos.',
      },
      { type: 'h2', text: '1. Fecha de expiración' },
      {
        type: 'p',
        text: 'La causa número uno de caídas relacionadas con TLS es un certificado caducado. Los de Let\'s Encrypt duran 90 días y se renuevan solos… hasta que la renovación automática falla en silencio y nadie lo nota hasta que la web deja de cargar.',
      },
      {
        type: 'note',
        text: 'Ponte una alerta a 30 días, no a 7. Si la renovación automática está rota, necesitas margen para diagnosticarla sin prisa.',
      },
      { type: 'h2', text: '2. Cadena de confianza completa' },
      {
        type: 'p',
        text: 'El servidor debe enviar tu certificado y todos los intermedios hasta la raíz. Si falta un intermedio, muchos navegadores lo arreglan solos descargándolo, pero los clientes que no lo hacen —curl, librerías HTTP, aplicaciones móviles, sistemas de pago— fallan con un error de verificación.',
      },
      {
        type: 'p',
        text: 'Es el error más traicionero precisamente porque en tu navegador todo se ve bien. Compruébalo siempre con una herramienta externa, no abriendo la web.',
      },
      { type: 'h2', text: '3. Cobertura del nombre' },
      {
        type: 'p',
        text: 'El certificado tiene que cubrir exactamente el nombre que se usa. Un comodín *.ejemplo.com cubre www.ejemplo.com pero no ejemplo.com a secas, ni a.b.ejemplo.com. Revisa la lista de SAN (Subject Alternative Names), no el Common Name, que hace años que los navegadores ignoran.',
      },
      { type: 'h2', text: '4. Versión de TLS y algoritmos' },
      {
        type: 'ul',
        items: [
          'TLS 1.3 — lo deseable. Más rápido y sin los modos inseguros heredados.',
          'TLS 1.2 — aceptable, todavía mayoritario.',
          'TLS 1.0 y 1.1 — obsoletos desde 2020. Desactívalos: dan puntuación baja y te sacan del cumplimiento PCI DSS.',
          'SSL 3.0 y anteriores — rotos. Si están activos, es una urgencia.',
        ],
      },
      {
        type: 'p',
        text: 'En cuanto a la clave: RSA de 2048 bits es el mínimo aceptable hoy; ECDSA P-256 ofrece seguridad equivalente con menos coste de CPU, algo a tener en cuenta si tu servidor es modesto.',
      },
      { type: 'h2', text: '5. Lo que el candado no te cuenta' },
      {
        type: 'ul',
        items: [
          'Si el servidor aún ofrece suites de cifrado débiles junto a las buenas.',
          'Si falta la redirección de HTTP a HTTPS, dejando una puerta en claro abierta.',
          'Si hay contenido mixto: recursos cargados por HTTP dentro de una página HTTPS.',
          'Si el certificado se emitió para un dominio que ya no controlas del todo.',
        ],
      },
      { type: 'h2', text: 'Comprobación rápida desde la terminal' },
      { type: 'code', text: 'openssl s_client -connect ejemplo.com:443 -servername ejemplo.com < /dev/null 2>/dev/null | openssl x509 -noout -dates -subject -issuer' },
      {
        type: 'p',
        text: 'Y si prefieres verlo todo de un vistazo, analiza el dominio en Domisafe: emisor, fechas, cadena, protocolo negociado y algoritmo, junto con el resto del informe de seguridad.',
      },
    ],
  },
];

export function getPosts(): Post[] {
  return [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getPost(slug: string): Post | undefined {
  return posts.find((post) => post.slug === slug);
}
