const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export type TurnstileOutcome =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Verifica el token de Cloudflare Turnstile.
 *
 * Política deliberada: en producción, si no hay TURNSTILE_SECRET_KEY el endpoint
 * queda cerrado (503). Es preferible que el formulario no funcione a que quede
 * un escaneador público sin CAPTCHA. En desarrollo local, sin clave, se permite
 * pasar para poder trabajar sin cuenta de Cloudflare.
 */
export async function verifyTurnstile(token: string | undefined, ip: string): Promise<TurnstileOutcome> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return {
        ok: false,
        status: 503,
        error: 'El servicio no está configurado correctamente. Inténtalo más tarde.',
      };
    }
    return { ok: true };
  }

  if (!token) {
    return { ok: false, status: 400, error: 'Completa la verificación anti-bots.' };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip && ip !== 'unknown') body.set('remoteip', ip);

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(8000),
    });
    const result = (await response.json()) as { success?: boolean };

    if (!result.success) {
      return { ok: false, status: 403, error: 'Verificación anti-bots fallida. Recarga la página.' };
    }
    return { ok: true };
  } catch {
    // Fallo de red hacia Cloudflare: se cierra el paso en vez de abrirlo.
    return { ok: false, status: 503, error: 'No se pudo completar la verificación. Inténtalo de nuevo.' };
  }
}
