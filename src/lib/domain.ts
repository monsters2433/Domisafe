/**
 * Validación y normalización de dominios.
 *
 * Toda entrada del usuario pasa por aquí antes de llegar a cualquier check.
 * Se rechazan explícitamente las direcciones internas para que el servicio no
 * pueda usarse como proxy contra la red local del servidor (SSRF).
 */

const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Rangos que nunca deben escanearse: son la red de casa, no internet. */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'ip6-localhost',
  'broadcasthost',
]);

const BLOCKED_TLDS = new Set(['local', 'localhost', 'internal', 'lan', 'home', 'test', 'example', 'invalid', 'onion']);

export interface ParsedDomain {
  ok: boolean;
  domain: string;
  error?: string;
}

export function parseDomain(input: string): ParsedDomain {
  let raw = (input ?? '').trim().toLowerCase();

  if (!raw) {
    return { ok: false, domain: '', error: 'Escribe un dominio.' };
  }
  if (raw.length > 253) {
    return { ok: false, domain: '', error: 'El dominio es demasiado largo.' };
  }

  // Acepta que peguen una URL completa.
  if (raw.includes('://')) {
    try {
      raw = new URL(raw).hostname;
    } catch {
      return { ok: false, domain: '', error: 'La URL no es válida.' };
    }
  }

  // Quita usuario, puerto, ruta y punto final.
  raw = raw.split('@').pop() ?? raw;
  raw = raw.split('/')[0];
  raw = raw.split(':')[0];
  raw = raw.replace(/\.$/, '');
  if (raw.startsWith('www.')) raw = raw.slice(4);

  if (!raw) {
    return { ok: false, domain: '', error: 'Escribe un dominio.' };
  }
  if (BLOCKED_HOSTNAMES.has(raw)) {
    return { ok: false, domain: '', error: 'No se pueden analizar direcciones internas.' };
  }
  // Una IP no es un dominio: el informe se construye sobre DNS y WHOIS.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(raw) || raw.includes(':')) {
    return { ok: false, domain: '', error: 'Introduce un dominio, no una dirección IP.' };
  }

  const labels = raw.split('.');
  if (labels.length < 2) {
    return { ok: false, domain: '', error: 'Falta la extensión del dominio (por ejemplo .com).' };
  }
  if (labels.some((label) => !LABEL.test(label))) {
    return { ok: false, domain: '', error: 'El dominio contiene caracteres no válidos.' };
  }

  const tld = labels[labels.length - 1];
  if (BLOCKED_TLDS.has(tld)) {
    return { ok: false, domain: '', error: 'Esa extensión no corresponde a un dominio público.' };
  }
  if (/^\d+$/.test(tld)) {
    return { ok: false, domain: '', error: 'La extensión del dominio no es válida.' };
  }

  return { ok: true, domain: raw };
}

export function isValidDomain(input: string): boolean {
  return parseDomain(input).ok;
}
