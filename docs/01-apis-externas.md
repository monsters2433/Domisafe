# APIs externas: qué dar de alta y con qué plan

Resumen de lo que hay que contratar **antes de la Fase 3** (conexión de datos reales).
Todo lo marcado como *sin alta* no necesita cuenta ni clave.

> Los límites de los planes gratuitos cambian con frecuencia. Verifica el cupo vigente
> en la web del proveedor antes de dimensionar la caché.

## Resumen rápido

| Servicio | Para qué | Plan gratuito (orientativo) | ¿Imprescindible? |
|---|---|---|---|
| **crt.sh** | Subdominios vía Certificate Transparency | Sin alta, sin clave. Cortesía. | Sí |
| **DNS público** (resolver del sistema / DoH de Cloudflare) | SPF, DKIM, DMARC, MX, A/AAAA | Sin alta | Sí |
| **TLS del propio dominio** (módulo `tls` de Node) | Certificado, cadena, expiración | Sin alta | Sí |
| **Cabeceras HTTP** (un `GET`/`HEAD` al dominio) | CSP, HSTS, X-Frame-Options… | Sin alta | Sí |
| **RDAP** (sustituto moderno de WHOIS) | Registrador, antigüedad, expiración | Sin alta, HTTP, sin clave | Sí |
| **Spamhaus / DNSBL** | Listas negras | Consulta DNS gratuita **solo con resolver propio**, no con 1.1.1.1/8.8.8.8 | Sí |
| **AbuseIPDB** | Reputación de IP | Plan gratuito con cupo diario de consultas | Recomendado |
| **VirusTotal** | Reputación dominio/IP + multi-motor | API pública gratuita, limitada por minuto/día | Recomendado |
| **Shodan** | Puertos/servicios ya escaneados por ellos | De pago en la práctica (licencia de por vida barata en oferta); la clave gratuita casi no da acceso a la API | Opcional |
| **Censys** | Alternativa a Shodan | Plan comunitario con cupo mensual bajo | Alternativa |
| **HaveIBeenPwned** | Brechas de datos del dominio | API de pago (suscripción mensual barata por clave) | Opcional |

## Detalle y orden de alta recomendado

### 1. Gratis y sin cuenta — hazlo primero (Fase 3a)

Cubren el 70 % del valor del informe sin gastar un euro:

- **Certificado TLS**: conexión TLS directa desde el servidor al puerto 443 del dominio.
  Es una conexión legítima de cliente, igual que abrir la web en un navegador — no es
  un escaneo. Coste: ~1 conexión, milisegundos.
- **Cabeceras HTTP**: un `GET` con `Range: bytes=0-0` o un `HEAD`. Mismo razonamiento.
- **DNS (SPF/DKIM/DMARC/MX)**: consultas normales al resolver.
- **RDAP** (`https://rdap.org/domain/ejemplo.com`): el reemplazo estándar de WHOIS.
  Devuelve JSON, no hay que parsear texto libre y no tiene los límites agresivos del
  WHOIS por puerto 43. **Usa RDAP, no WHOIS**.
- **crt.sh** (`https://crt.sh/?q=%25.ejemplo.com&output=json`): subdominios a partir de
  Certificate Transparency. Es un servicio de cortesía y a veces va lento o devuelve
  502 — trátalo como "puede fallar" y cachea agresivamente (24 h).

### 2. Gratis con cuenta — segunda tanda (Fase 3b)

- **AbuseIPDB** — https://www.abuseipdb.com/register
  Plan gratuito con cupo diario de consultas. Da una puntuación de abuso 0-100 por IP.
  Cachea por IP, no por dominio: muchos dominios comparten IP (Cloudflare, hosting
  compartido) y así el cupo cunde mucho más.

- **VirusTotal** — https://www.virustotal.com/gui/join-us
  API pública gratuita, con límite por minuto y por día. Es el cuello de botella más
  probable, así que:
  - cachea 6-24 h por dominio,
  - cólalo en una cola con concurrencia 1,
  - si se agota el cupo, marca el check como `no disponible` en vez de romper el informe.

- **Spamhaus / DNSBL**: las consultas por DNS son gratuitas **solo si las haces desde tu
  propio resolver recursivo**. Si usas 1.1.1.1 o 8.8.8.8 te bloquean por volumen y todo
  sale "listado" (falso positivo peligroso). En el servidor: instala `unbound` como
  resolver local y apunta ahí las consultas DNSBL. Si no quieres montar resolver, salta
  este check.

### 3. De pago — solo cuando haya tráfico que lo justifique (Fase 4)

- **Shodan** — https://account.shodan.io/register
  La clave gratuita prácticamente no sirve para la API de búsqueda. Suelen sacar una
  licencia de por vida barata en promociones (Black Friday). Es la fuente correcta para
  "puertos abiertos" **sin escanear tú**: Shodan ya escanea internet legalmente y tú solo
  consultas su base de datos. Endpoint: `/shodan/host/{ip}`.

- **Censys** — https://search.censys.io/register
  Alternativa con plan comunitario y cupo mensual bajo. Sirve para validar Shodan o
  sustituirlo si no quieres pagar.

- **HaveIBeenPwned** — https://haveibeenpwned.com/API/Key
  La API de brechas por dominio requiere clave de pago (suscripción mensual barata).
  Ojo: el endpoint de *breached domain* exige además **verificar la propiedad del
  dominio**, así que encaja de forma natural en el Nivel 2, no en el Nivel 1.
  El endpoint de contraseñas (`Pwned Passwords`) sí es gratuito y sin clave, pero no
  aplica a nuestro caso.

## Estrategia de coste y de recursos

El servidor es doméstico, así que el diseño asume esto:

1. **Cachear siempre antes de llamar.** Todo resultado externo se guarda con TTL
   (`SCAN_CACHE_TTL_SECONDS`). Un segundo escaneo del mismo dominio dentro de la ventana
   no gasta ni una llamada.
2. **Caché por clave natural, no por dominio.** La reputación se cachea por IP, los
   subdominios por dominio raíz, RDAP por dominio. Reutiliza mucho más.
3. **Degradación elegante.** Si falta una clave o se agota el cupo, ese check sale como
   `no disponible` con su motivo. El informe nunca falla entero por una API caída.
4. **Timeouts cortos** (5 s por proveedor) y **concurrencia limitada**, para no dejar
   conexiones colgando ni saturar la línea de casa.
5. **Ninguna API se llama desde el navegador.** Todas las claves viven en `.env` del
   servidor y solo las usa el backend.
