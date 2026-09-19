# Cloudflare Tunnel apuntando al servicio local

Objetivo: publicar `domisafe.org` sin abrir los puertos 80/443 del router de casa y sin
exponer la IP doméstica.

```
Internet → Cloudflare (DDoS, WAF, caché) → túnel saliente → cloudflared → Nginx :443 → Next.js :3000
```

El túnel es una **conexión saliente** del servidor hacia Cloudflare. El router no
necesita ningún port forwarding.

## 1. Instalar cloudflared

```bash
# Debian/Ubuntu (lo normal en HestiaCP)
curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg \
  | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main" \
  | sudo tee /etc/apt/sources.list.d/cloudflared.list
sudo apt update && sudo apt install -y cloudflared
cloudflared --version
```

## 2. Autenticar contra tu cuenta

```bash
sudo cloudflared tunnel login
```

Abre una URL en el navegador; seleccionas la zona `domisafe.org`. Descarga
`~/.cloudflared/cert.pem` (credencial de la cuenta — **no la subas a git**).

## 3. Crear el túnel

```bash
sudo cloudflared tunnel create domisafe
```

Devuelve un UUID y crea `/root/.cloudflared/<UUID>.json` (credencial del túnel, también
secreta). Apunta el UUID.

## 4. Configurar el túnel

Copia `deploy/cloudflared-config.yml` a `/etc/cloudflared/config.yml` y sustituye
`<TUNNEL-UUID>`:

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /root/.cloudflared/<TUNNEL-UUID>.json

ingress:
  - hostname: domisafe.org
    service: https://127.0.0.1:443
    originRequest:
      originServerName: domisafe.org
      httpHostHeader: domisafe.org
  - hostname: www.domisafe.org
    service: https://127.0.0.1:443
    originRequest:
      originServerName: domisafe.org
      httpHostHeader: domisafe.org
  - service: http_status:404
```

Apuntamos a **Nginx en 443**, no directamente a Next.js en 3000, porque Nginx es quien
aplica `limit_req`, cabeceras y caché de estáticos. Si apuntaras al 3000 te saltarías el
rate limiting de Nginx.

Requiere el **Origin Certificate de Cloudflare** instalado en Nginx (ver
`02-despliegue-hestia.md`). Si prefieres empezar sin él, usa `service: http://127.0.0.1:80`
y añade `noTLSVerify: true` — pero pasa a HTTPS en cuanto puedas.

## 5. DNS

```bash
sudo cloudflared tunnel route dns domisafe domisafe.org
sudo cloudflared tunnel route dns domisafe www.domisafe.org
```

Esto crea registros `CNAME` hacia `<UUID>.cfargotunnel.com` con **proxy naranja
obligatorio**. Borra en el panel de Cloudflare cualquier registro `A` anterior que
apuntase a tu IP doméstica — si queda, tu IP sigue siendo pública.

## 6. Arrancar como servicio

```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
sudo systemctl status cloudflared
journalctl -u cloudflared -f
```

## 7. Ajustes recomendados en el panel de Cloudflare

- **SSL/TLS → Overview**: modo **Full (strict)**.
- **SSL/TLS → Edge Certificates**: "Always Use HTTPS" activado.
- **Security → WAF → Rate limiting rules**: una regla extra sobre `/api/scan`
  (p. ej. 10 peticiones por minuto e IP). Es la primera línea, antes incluso de que el
  tráfico entre en el túnel — gratis en términos de recursos de tu casa.
- **Caching**: regla de caché para `/_next/static/*` con TTL alto.
- **Speed → Brotli**: activado.

## 8. Verificación

```bash
# Desde fuera de casa (o con el móvil en 4G):
curl -sI https://domisafe.org | head -20
# La IP que resuelve debe ser de Cloudflare, nunca la tuya:
dig +short domisafe.org
```

Comprueba también que **los puertos 80/443 del router siguen cerrados**. Si tenías port
forwarding de una configuración anterior, elimínalo ahora: con el túnel funcionando es
una puerta abierta sin motivo.

## Seguridad operativa

- `cert.pem` y `<UUID>.json` son credenciales. Permisos `600`, propiedad de root, fuera
  del repositorio (ya cubierto por `.gitignore`).
- El túnel solo publica lo que declaras en `ingress`. El resto del servidor (panel de
  HestiaCP en el 8083, SSH, …) **no queda expuesto** salvo que lo añadas explícitamente.
- Si algún día publicas el panel de Hestia por el túnel, ponle delante Cloudflare Access.
