# Fase 2: Persistencia con SQLite

## Cambios principales

### 1. Base de datos SQLite
- **Ubicación**: `data/domisafe.db`
- **Creación automática**: al primer inicio del servidor
- **Carpeta**: se crea automáticamente si no existe
- **Permisos**: `data/` con permisos 700 (solo propietario)

### 2. Tablas

#### `scan_reports`
Caché de reportes con TTL (Time To Live). Reemplaza la caché de memoria de Fase 1.

```sql
CREATE TABLE scan_reports (
  domain TEXT PRIMARY KEY,
  report_json TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  cached_at INTEGER NOT NULL
);
CREATE INDEX idx_scan_reports_expires_at ON scan_reports(expires_at);
```

**Beneficio**: Un segundo escaneo del mismo dominio no gasta llamadas a APIs externas (reutiliza el reporte cacheado).

#### `scan_logs`
Registro de auditoría de cada escaneo, con metadata del cliente.

```sql
CREATE TABLE scan_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  domain TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT,
  duration_ms INTEGER,
  scanned_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX idx_scan_logs_domain ON scan_logs(domain);
CREATE INDEX idx_scan_logs_scanned_at ON scan_logs(scanned_at);
CREATE INDEX idx_scan_logs_ip_address ON scan_logs(ip_address);
```

**Registro de cada escaneo con**:
- `status`: 'success', 'error', 'rate_limited', 'invalid_domain'
- `ip_address`: IP real del visitante (de Cloudflare)
- `user_agent`: navegador/cliente
- `duration_ms`: tiempo que tardó la comprobación
- `scanned_at`: timestamp del escaneo
- `created_at`: timestamp del registro (auditoría)

### 3. Interfaz de store.ts
**Sin cambios públicos**. Las funciones `getReport()` y `saveReport()` mantienen la misma firma:

```ts
export function getReport(domain: string): ScanReport | null;
export function saveReport(report: ScanReport): void;
```

Esto permite cambiar la implementación sin afectar componentes o rutas.

**Fallback automático**: Si `better-sqlite3` no está disponible (ej. build standalone sin node_modules), usa caché en memoria como en Fase 1.

### 4. Endpoint de estadísticas

**URL**: `GET /api/stats`  
**Parámetros**: `?days=7` (opcional, defecto 7)  
**Autenticación**: Restringido a localhost / red privada

**Respuesta ejemplo**:
```json
{
  "period": "últimos 7 días",
  "totalScans": 42,
  "uniqueDomains": 15,
  "successCount": 40,
  "errorCount": 1,
  "rateLimitedCount": 0,
  "invalidDomainCount": 1,
  "topDomains": [
    { "domain": "github.com", "count": 8 },
    { "domain": "example.com", "count": 5 }
  ],
  "lastScanTime": 1726773600000
}
```

**Acceso local**:
```bash
curl http://127.0.0.1:3000/api/stats
curl http://127.0.0.1:3000/api/stats?days=30
```

## Dependencias nuevas

```json
{
  "better-sqlite3": "^11.x"  // SQLite síncrono para Node.js
}
```

## Notas de despliegue

### En HestiaCP (Fase 2 → Fase 3)

1. **Copiar `data/`**: Asegurar que la carpeta tenga permisos correctos:
   ```bash
   mkdir -p /home/domisafe/data
   chmod 700 /home/domisafe/data
   chown domisafe:domisafe /home/domisafe/data
   ```

2. **Backups**: La BD crece con cada escaneo. En producción:
   ```bash
   # Backup semanal
   0 2 * * 0 sqlite3 /home/domisafe/data/domisafe.db ".backup /mnt/backups/domisafe-$(date +\%Y\%m\%d).db"
   ```

3. **Monitoreo**: Revisar `/api/stats` periódicamente para detectar picos de uso o errores.

4. **Limpieza de expirados**: La aplicación limpia automáticamente reportes expirados (oportunista). Si la BD crece mucho:
   ```bash
   # Vacío manual (reexportar datos vivos)
   sqlite3 /home/domisafe/data/domisafe.db "VACUUM;"
   ```

### Modo standalone (build standalone)

Si el servidor corre como `.next/standalone/server.js` sin `node_modules`:

- La BD no se puede inicializar (better-sqlite3 no disponible)
- **Fallback automático**: usa caché en memoria
- **Limitación**: sin persistencia entre reinicios
- **Solución**: copiar `node_modules` al bundle o usar standalone oficial de Next.js con `node-modules-polyfill`

## Próxima fase (Fase 3)

La Fase 3 reemplazará `src/lib/mock.ts` por APIs reales:
- TLS: OpenSSL o APIs como `certinfo.org`, `crt.sh`
- Cabeceras: HTTP directo al dominio
- DNS: Node `dns.promises`
- DNSBL: Spamhaus, Uribl, etc.
- Reputación IP: AbuseIPDB, VirusTotal

**Sin cambiar la firma de `ScanReport`** ni el contrato de BD.
