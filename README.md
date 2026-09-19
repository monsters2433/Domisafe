# Domisafe

Verificación de seguridad de dominios: certificado SSL/TLS, cabeceras HTTP, SPF, DKIM,
DMARC, listas negras, reputación de IP y superficie expuesta. Todo a partir de fuentes
públicas, sin escaneos intrusivos.

Autoalojado en servidor propio (HestiaCP + PM2 + Nginx) y publicado a internet mediante
Cloudflare Tunnel.

## Estado

**Fase 1 completada** — esqueleto funcional con datos de ejemplo.

| Fase | Contenido | Estado |
|---|---|---|
| 1 | Esqueleto: landing, formulario, informe con datos mock, blog, legales, SEO | ✅ Hecho |
| 2 | Persistencia real (SQLite), caché en disco, registro de escaneos | Pendiente |
| 3 | Checks reales pasivos (TLS, cabeceras, DNS, RDAP, crt.sh, DNSBL, reputación) | Pendiente |
| 4 | Nivel 2: verificación de propiedad por TXT + escaneo activo autorizado + CVE | Pendiente |
| 5 | AdSense en producción y ajuste fino de Core Web Vitals | Pendiente |

## Documentación

- [`docs/01-apis-externas.md`](docs/01-apis-externas.md) — qué APIs dar de alta, planes
  gratuitos y estrategia de coste.
- [`docs/02-despliegue-hestia.md`](docs/02-despliegue-hestia.md) — estructura del
  proyecto y puesta en marcha en el servidor.
- [`docs/03-cloudflare-tunnel.md`](docs/03-cloudflare-tunnel.md) — publicar el servicio
  sin abrir puertos en el router.

## Desarrollo local

```bash
npm install
cp .env.example .env    # opcional en local
npm run dev             # http://localhost:3000
```

En desarrollo, si no hay `TURNSTILE_SECRET_KEY` el CAPTCHA se omite para poder trabajar
sin cuenta de Cloudflare. **En producción, sin esa clave el endpoint de escaneo devuelve
503**: es preferible que el formulario no funcione a dejar un escaneador público abierto.

```bash
npm run build      # build de producción (salida standalone)
npm run typecheck  # comprobación de tipos
```

## Reglas del proyecto

Restricciones de diseño que no deben romperse:

1. **Ningún escaneo activo sin verificación de propiedad.** Los checks del Nivel 1 son
   pasivos: consultan datos públicos o establecen conexiones de cliente normales (abrir
   la web, resolver DNS). Los puertos abiertos se obtienen de Shodan/Censys, que ya
   escanean internet legalmente — nunca escaneamos nosotros.
2. **Rate limiting y Turnstile siempre activos** en el formulario público, en las tres
   capas: WAF de Cloudflare, `limit_req` de Nginx y `checkRateLimit` en la aplicación.
3. **Ninguna credencial en el repositorio.** Todas las claves viven en `.env` del
   servidor con permisos `600`, ignorado por git.
4. **Consumo contenido.** El servidor es doméstico: caché con TTL antes de cada llamada
   externa, timeouts cortos, concurrencia limitada y `max_memory_restart` en PM2.

## Estructura

```
src/
├── app/          Rutas (App Router), API, sitemap, robots
├── components/   UI
└── lib/          Dominio, scoring, caché, rate limit, Turnstile, contenido
deploy/           Plantillas de Nginx, PM2 y cloudflared
docs/             Documentación de APIs, despliegue y túnel
```

El contrato entre backend y UI es el tipo `ScanReport` de
[`src/lib/types.ts`](src/lib/types.ts). La Fase 3 sustituye el generador de
[`src/lib/mock.ts`](src/lib/mock.ts) por comprobaciones reales sin tocar la interfaz.
