# Despliegue en el servidor casero (HestiaCP + PM2 + Nginx)

## Decisión de arquitectura: monolito Next.js, no dos servicios

Descartado el Express separado. Motivo: en un servidor doméstico, **dos procesos Node
son el doble de RAM** (~150-250 MB cada uno) y el doble de superficie que mantener, y
no ganas nada — el backend de checks no necesita escalar por separado.

Se usan **Route Handlers de Next.js** (`src/app/api/**`), que son Node del lado servidor
con las mismas capacidades que Express. Si algún día hace falta separar, la lógica ya
está aislada en `src/lib/checks/` y se extrae sin tocar la UI.

Los escaneos que tarden (Nivel 2) van a una **cola en proceso con concurrencia 1-2**, no
a un worker aparte, por el mismo motivo de recursos.

## Estructura de carpetas

```
domisafe/
├── docs/                          Documentación (esto)
├── deploy/                        Plantillas de configuración del servidor
│   ├── nginx-domisafe.conf        Proxy + limit_req para HestiaCP
│   ├── cloudflared-config.yml     Túnel de Cloudflare
│   └── domisafe.pm2.json          Definición del proceso PM2
├── public/                        Estáticos (favicon, og-image, …)
├── src/
│   ├── app/
│   │   ├── layout.tsx             Layout raíz: tema, header, footer, cookies
│   │   ├── page.tsx               Landing + formulario de escaneo
│   │   ├── globals.css            Tokens de diseño + Tailwind v4
│   │   ├── scan/[domain]/page.tsx Página de informe (SSR)
│   │   ├── api/
│   │   │   └── scan/route.ts      POST: rate limit -> Turnstile -> checks
│   │   ├── blog/                  Guías SEO
│   │   ├── legal/                 Privacidad, términos, cookies
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/                UI (ScanForm, ScoreGauge, CheckCard, …)
│   └── lib/
│       ├── types.ts               Contrato del informe
│       ├── scoring.ts             Puntuación y nota
│       ├── mock.ts                Datos de ejemplo (Fase 1)
│       ├── store.ts               Caché de informes (memoria -> SQLite)
│       ├── rate-limit.ts          Límite por IP en aplicación
│       ├── turnstile.ts           Verificación del CAPTCHA
│       └── checks/                Fase 3: un fichero por proveedor
├── .env.example                   Plantilla (el .env real NO se versiona)
└── package.json
```

## Puesta en marcha en el servidor

### 1. Usuario y ubicación

En HestiaCP, crea el usuario de hosting (p. ej. `domisafe`) y el dominio `domisafe.org`
desde el panel. Hestia genera `/home/domisafe/web/domisafe.org/`.

**No pongas la app Node dentro de `public_html`**: ese directorio lo sirve Nginx
directamente y expondría el código fuente. Usa una carpeta hermana:

```bash
sudo -u domisafe mkdir -p /home/domisafe/app /home/domisafe/data /home/domisafe/logs
cd /home/domisafe/app
sudo -u domisafe git clone https://github.com/monsters2433/Domisafe.git .
```

### 2. Node y dependencias

```bash
# Node 20 LTS o superior (nvm como usuario domisafe, o paquete del sistema)
node -v            # >= 20.9

sudo -u domisafe npm ci --omit=dev
sudo -u domisafe npm run build
```

### 3. Fichero de entorno con permisos restringidos

```bash
sudo -u domisafe cp .env.example .env
sudo -u domisafe nano .env        # rellenar claves
chmod 600 /home/domisafe/app/.env
chown domisafe:domisafe /home/domisafe/app/.env
```

`.env` está en `.gitignore`. **Nunca** se commitea.

### 4. PM2

```bash
sudo npm install -g pm2
sudo -u domisafe pm2 start deploy/domisafe.pm2.json
sudo -u domisafe pm2 save
sudo env PATH=$PATH pm2 startup systemd -u domisafe --hp /home/domisafe
```

La app escucha en `127.0.0.1:3000` — **solo loopback**, nunca en `0.0.0.0`.

### 5. Nginx desde HestiaCP

Hestia gestiona sus propias plantillas, así que no edites el `.conf` generado (se
sobrescribe). Dos opciones:

**Opción A (recomendada): plantilla propia de Hestia.**
Copia `deploy/nginx-domisafe.conf` a
`/usr/local/hestia/data/templates/web/nginx/nodejs.tpl` (y `.stpl` para la versión SSL),
adapta las variables `%ip%`, `%domain%`, `%proxy_port%` y asigna la plantilla al dominio
desde el panel (Edit Web Domain → Proxy Template).

**Opción B (rápida): fichero de include.**
Hestia respeta `/home/domisafe/conf/web/domisafe.org/nginx.conf_*`. Crea ahí un
`nginx.conf_domisafe` con el bloque `location` del proxy y recarga.

En ambos casos hay que declarar las zonas `limit_req_zone` a nivel `http`, es decir en
`/etc/nginx/conf.d/domisafe-limits.conf` (ver `deploy/nginx-domisafe.conf`).

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### 6. Certificados SSL

Dos escenarios, según el proxy de Cloudflare:

- **Nube gris (solo DNS)**: Let's Encrypt desde Hestia, normal.
- **Nube naranja (proxy activo) o Cloudflare Tunnel**: modo **Full (strict)** en
  Cloudflare + **Origin Certificate** de Cloudflare en el servidor (válido 15 años, no
  requiere renovación ni puerto 80 abierto). Genera el certificado en
  Cloudflare → SSL/TLS → Origin Server, y súbelo en Hestia → Edit Web Domain → SSL
  Certificate (pegando certificado y clave).

Con Cloudflare Tunnel (la opción elegida) el tráfico llega ya cifrado por el túnel; aun
así deja el certificado de origen para que la conexión `cloudflared → Nginx` vaya por
HTTPS y no en claro dentro de la máquina.

> **Importante con Cloudflare delante**: la IP real del visitante llega en
> `CF-Connecting-IP`. Sin configurar `real_ip`, todos los visitantes parecen la misma IP
> y el rate limiting no sirve de nada. Está resuelto en `deploy/nginx-domisafe.conf`.

### 7. Actualizaciones

```bash
cd /home/domisafe/app
sudo -u domisafe git pull
sudo -u domisafe npm ci --omit=dev
sudo -u domisafe npm run build
sudo -u domisafe pm2 reload domisafe
```

## Consumo de recursos (servidor doméstico)

- `max_memory_restart: 400M` en PM2: si algo se desmadra, se reinicia solo.
- Una sola instancia (`instances: 1`): el cluster mode multiplicaría la RAM sin ganancia
  real con este volumen de tráfico.
- Caché de informes con TTL: el segundo escaneo del mismo dominio no toca la red.
- Cola con concurrencia limitada para los checks activos del Nivel 2.
- Nginx cachea y comprime los estáticos de `/_next/static` (inmutables, 1 año).
