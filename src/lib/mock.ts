import { computeScore, toGrade } from './scoring';
import type { CheckResult, ScanReport } from './types';

/**
 * FASE 1 — generador de informes de ejemplo.
 *
 * Es determinista: el mismo dominio produce siempre el mismo informe, de modo
 * que la demo es coherente al recargar y al compartir el enlace. Se sustituye
 * entero en la Fase 3 por src/lib/checks/*, sin tocar la UI: el contrato es
 * ScanReport y no cambia.
 */

function seedFrom(domain: string): number {
  let hash = 2166136261;
  for (let i = 0; i < domain.length; i++) {
    hash ^= domain.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function makeRandom(seed: number): () => number {
  let state = seed || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

function pick<T>(random: () => number, options: T[]): T {
  return options[Math.floor(random() * options.length)];
}

function daysFromNow(days: number): string {
  const date = new Date(Date.now() + days * 86400000);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
}

export function buildMockReport(domain: string): ScanReport {
  const random = makeRandom(seedFrom(domain));
  const started = Date.now();

  // Perfil global: determina si el dominio de ejemplo sale bien o mal parado.
  const profile = random();
  const good = profile > 0.55;
  const poor = profile < 0.25;

  const certDaysLeft = good ? 60 + Math.floor(random() * 240) : Math.floor(random() * 25);
  const hasHsts = good || random() > 0.5;
  const hasCsp = good && random() > 0.35;
  const dmarcPolicy = poor ? 'none' : good ? 'reject' : pick(random, ['quarantine', 'none']);
  const domainAgeYears = 1 + Math.floor(random() * 18);
  const abuseScore = poor ? 40 + Math.floor(random() * 55) : Math.floor(random() * 8);
  const subdomains = 3 + Math.floor(random() * 40);
  const openPorts = good ? [80, 443] : [80, 443, ...pick(random, [[22], [21, 3306], [8080, 25]])];
  const breachCount = poor ? 2 + Math.floor(random() * 5) : random() > 0.7 ? 1 : 0;

  const checks: CheckResult[] = [
    {
      id: 'tls-certificate',
      category: 'tls',
      title: 'Certificado SSL/TLS',
      status: certDaysLeft > 30 ? 'pass' : certDaysLeft > 7 ? 'warn' : 'fail',
      score: certDaysLeft > 30 ? 100 : certDaysLeft > 7 ? 65 : 20,
      weight: 20,
      summary:
        certDaysLeft > 30
          ? `Certificado válido y con cadena de confianza completa. Caduca en ${certDaysLeft} días.`
          : `El certificado caduca en ${certDaysLeft} días. Renuévalo antes de que expire.`,
      details: [
        { label: 'Emisor', value: pick(random, ["Let's Encrypt R11", 'Google Trust Services WE1', 'DigiCert TLS RSA SHA256']) },
        { label: 'Válido hasta', value: daysFromNow(certDaysLeft), status: certDaysLeft > 30 ? 'pass' : 'warn' },
        { label: 'Algoritmo de firma', value: 'SHA-256 con RSA 2048 bits', status: 'pass' },
        { label: 'Protocolo negociado', value: good ? 'TLS 1.3' : 'TLS 1.2', status: good ? 'pass' : 'warn' },
        { label: 'Cadena de confianza', value: 'Completa (3 certificados)', status: 'pass' },
      ],
      recommendation:
        certDaysLeft > 30
          ? undefined
          : 'Automatiza la renovación con Certbot o el gestor de tu panel para evitar caídas por certificado caducado.',
      source: 'Conexión TLS directa',
    },
    {
      id: 'security-headers',
      category: 'headers',
      title: 'Cabeceras de seguridad HTTP',
      status: hasCsp && hasHsts ? 'pass' : hasHsts ? 'warn' : 'fail',
      score: hasCsp && hasHsts ? 95 : hasHsts ? 60 : 30,
      weight: 18,
      summary:
        hasCsp && hasHsts
          ? 'El servidor envía las cabeceras de seguridad principales.'
          : 'Faltan cabeceras de seguridad relevantes que protegen frente a XSS y clickjacking.',
      details: [
        {
          label: 'Strict-Transport-Security',
          value: hasHsts ? 'max-age=31536000; includeSubDomains' : 'Ausente',
          status: hasHsts ? 'pass' : 'fail',
        },
        {
          label: 'Content-Security-Policy',
          value: hasCsp ? "default-src 'self'; frame-ancestors 'none'" : 'Ausente',
          status: hasCsp ? 'pass' : 'fail',
        },
        { label: 'X-Frame-Options', value: good ? 'DENY' : 'Ausente', status: good ? 'pass' : 'warn' },
        { label: 'X-Content-Type-Options', value: 'nosniff', status: 'pass' },
        {
          label: 'Referrer-Policy',
          value: good ? 'strict-origin-when-cross-origin' : 'Ausente',
          status: good ? 'pass' : 'warn',
        },
        { label: 'Permissions-Policy', value: hasCsp ? 'camera=(), microphone=()' : 'Ausente', status: hasCsp ? 'pass' : 'warn' },
      ],
      recommendation: hasCsp
        ? undefined
        : 'Añade una Content-Security-Policy. Empieza en modo Report-Only para detectar qué rompe antes de aplicarla.',
      source: 'Cabeceras de respuesta HTTP',
    },
    {
      id: 'email-auth',
      category: 'dns',
      title: 'Autenticación de correo (SPF, DKIM, DMARC)',
      status: dmarcPolicy === 'reject' ? 'pass' : dmarcPolicy === 'quarantine' ? 'warn' : 'fail',
      score: dmarcPolicy === 'reject' ? 100 : dmarcPolicy === 'quarantine' ? 70 : 35,
      weight: 18,
      summary:
        dmarcPolicy === 'reject'
          ? 'El dominio está protegido frente a suplantación de correo.'
          : dmarcPolicy === 'quarantine'
            ? 'DMARC está en cuarentena: protege parcialmente, pero no rechaza el correo falsificado.'
            : 'Sin política DMARC efectiva: cualquiera puede enviar correo haciéndose pasar por este dominio.',
      details: [
        { label: 'SPF', value: 'v=spf1 include:_spf.google.com ~all', status: 'pass' },
        {
          label: 'DKIM',
          value: good ? 'Selector "default" encontrado (RSA 2048)' : 'No se encontró ningún selector común',
          status: good ? 'pass' : 'warn',
        },
        {
          label: 'DMARC',
          value: `v=DMARC1; p=${dmarcPolicy}; rua=mailto:dmarc@${domain}`,
          status: dmarcPolicy === 'reject' ? 'pass' : dmarcPolicy === 'quarantine' ? 'warn' : 'fail',
        },
        { label: 'Registros MX', value: `${1 + Math.floor(random() * 4)} servidores configurados`, status: 'pass' },
      ],
      recommendation:
        dmarcPolicy === 'reject'
          ? undefined
          : 'Avanza gradualmente a p=reject: empieza en p=none con informes, revisa quién envía en tu nombre y endurece la política.',
      source: 'Consultas DNS',
    },
    {
      id: 'domain-registration',
      category: 'whois',
      title: 'Registro del dominio',
      status: 'info',
      score: domainAgeYears > 2 ? 100 : 70,
      weight: 6,
      summary: `Dominio registrado hace ${domainAgeYears} ${domainAgeYears === 1 ? 'año' : 'años'}.`,
      details: [
        { label: 'Registrador', value: pick(random, ['Cloudflare Registrar', 'OVH', 'GoDaddy', 'Namecheap', 'IONOS']) },
        { label: 'Fecha de registro', value: daysFromNow(-domainAgeYears * 365) },
        {
          label: 'Fecha de expiración',
          value: daysFromNow(30 + Math.floor(random() * 500)),
        },
        { label: 'Bloqueo de transferencia', value: good ? 'clientTransferProhibited' : 'Sin bloqueo', status: good ? 'pass' : 'warn' },
        { label: 'Privacidad WHOIS', value: random() > 0.4 ? 'Activada' : 'Datos públicos' },
      ],
      recommendation:
        domainAgeYears > 2
          ? undefined
          : 'Los dominios muy recientes generan más desconfianza en filtros antispam. Nada que corregir, solo tenlo en cuenta.',
      source: 'RDAP',
    },
    {
      id: 'blocklists',
      category: 'blocklists',
      title: 'Listas negras de spam y malware',
      status: poor ? 'fail' : 'pass',
      score: poor ? 15 : 100,
      weight: 14,
      summary: poor
        ? 'El dominio o su IP aparecen en al menos una lista negra reconocida.'
        : 'No aparece en ninguna de las listas negras consultadas.',
      details: [
        { label: 'Spamhaus DBL', value: poor ? 'Listado' : 'Limpio', status: poor ? 'fail' : 'pass' },
        { label: 'Spamhaus ZEN', value: poor ? 'Listado (SBL)' : 'Limpio', status: poor ? 'fail' : 'pass' },
        { label: 'SURBL', value: 'Limpio', status: 'pass' },
        { label: 'Barracuda', value: 'Limpio', status: 'pass' },
      ],
      recommendation: poor
        ? 'Identifica el origen (equipo comprometido, formulario abierto, vecino en hosting compartido), corrígelo y solicita la retirada en el formulario de cada lista.'
        : undefined,
      source: 'Consultas DNSBL',
    },
    {
      id: 'ip-reputation',
      category: 'reputation',
      title: 'Reputación de la IP',
      status: abuseScore > 25 ? 'fail' : abuseScore > 5 ? 'warn' : 'pass',
      score: Math.max(0, 100 - abuseScore),
      weight: 10,
      summary:
        abuseScore > 25
          ? `Puntuación de abuso del ${abuseScore}%: hay denuncias recientes asociadas a esta IP.`
          : 'Sin denuncias de abuso relevantes asociadas a la IP.',
      details: [
        { label: 'Dirección IP', value: `${104 + Math.floor(random() * 90)}.${Math.floor(random() * 255)}.${Math.floor(random() * 255)}.${1 + Math.floor(random() * 253)}` },
        { label: 'Puntuación de abuso', value: `${abuseScore}%`, status: abuseScore > 25 ? 'fail' : 'pass' },
        { label: 'Denuncias (90 días)', value: String(poor ? 10 + Math.floor(random() * 80) : 0) },
        { label: 'Detecciones antivirus', value: poor ? `${1 + Math.floor(random() * 4)} de 94 motores` : '0 de 94 motores', status: poor ? 'fail' : 'pass' },
        { label: 'Proveedor', value: pick(random, ['Cloudflare, Inc.', 'Hetzner Online', 'OVH SAS', 'Amazon AWS', 'DigitalOcean']) },
      ],
      recommendation: abuseScore > 25 ? 'Revisa si hay servicios comprometidos enviando tráfico malicioso desde esa IP.' : undefined,
      source: 'AbuseIPDB + VirusTotal',
    },
    {
      id: 'attack-surface',
      category: 'exposure',
      title: 'Superficie expuesta',
      status: openPorts.length > 2 ? 'warn' : 'pass',
      score: openPorts.length > 2 ? 60 : 95,
      weight: 10,
      summary:
        openPorts.length > 2
          ? `Fuentes públicas registran ${openPorts.length} puertos accesibles, algunos innecesarios en un servidor web.`
          : 'Solo se registran los puertos web habituales.',
      details: [
        { label: 'Subdominios encontrados', value: `${subdomains} (vía Certificate Transparency)` },
        {
          label: 'Puertos conocidos',
          value: openPorts.join(', '),
          status: openPorts.length > 2 ? 'warn' : 'pass',
        },
        { label: 'Servicios identificados', value: good ? 'nginx' : pick(random, ['nginx, OpenSSH', 'Apache, MySQL', 'nginx, Exim']) },
        { label: 'Última observación', value: daysFromNow(-Math.floor(random() * 20)) },
      ],
      recommendation:
        openPorts.length > 2
          ? 'Cierra en el cortafuegos todo lo que no tenga que estar en internet. SSH y bases de datos no deberían ser accesibles públicamente.'
          : undefined,
      source: 'Shodan / crt.sh (datos ya recopilados por terceros)',
    },
    {
      id: 'data-breaches',
      category: 'breaches',
      title: 'Filtraciones de datos conocidas',
      status: breachCount > 0 ? 'warn' : 'pass',
      score: breachCount > 0 ? Math.max(30, 100 - breachCount * 15) : 100,
      weight: 4,
      summary:
        breachCount > 0
          ? `${breachCount} ${breachCount === 1 ? 'filtración pública afecta' : 'filtraciones públicas afectan'} a direcciones de este dominio.`
          : 'No constan filtraciones públicas asociadas a este dominio.',
      details: [
        { label: 'Brechas registradas', value: String(breachCount), status: breachCount > 0 ? 'warn' : 'pass' },
        { label: 'Más reciente', value: breachCount > 0 ? daysFromNow(-90 - Math.floor(random() * 900)) : '—' },
        { label: 'Cuentas afectadas', value: breachCount > 0 ? String(1 + Math.floor(random() * 40)) : '0' },
      ],
      recommendation:
        breachCount > 0
          ? 'Fuerza el cambio de contraseña de las cuentas afectadas y activa verificación en dos pasos.'
          : undefined,
      source: 'HaveIBeenPwned',
    },
  ];

  const score = computeScore(checks);

  return {
    domain,
    scannedAt: new Date().toISOString(),
    durationMs: Date.now() - started + 800 + Math.floor(random() * 1500),
    cached: false,
    level: 1,
    score,
    grade: toGrade(score),
    checks,
    mock: true,
  };
}
