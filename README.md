# Domisafe
Web de Domisafe

## Bloqueo de PDFs con NIF/CIF

Herramienta local que cifra (AES-256) un PDF usando el NIF/CIF del cliente como contraseña.

```bash
pip install -r requirements.txt
python bloquear_pdf.py bloquear certificado.pdf --nif B12345678
python bloquear_pdf.py desbloquear certificado_bloqueado.pdf --nif B12345678
```

- Sin `--nif`, se pide por pantalla sin mostrarlo.
- Al bloquear se valida el NIF/NIE/CIF (letra de control).
- El cliente puede abrir el PDF bloqueado con cualquier lector escribiendo su NIF/CIF.

## App para Mac

`app_mac.py` abre una ventana para elegir el PDF, escribir el NIF/CIF y pulsar **Bloquear** o **Desbloquear**.

```bash
python3 app_mac.py      # ejecutar directamente
./build_mac.sh          # generar "dist/Domisafe PDF.app" (hay que ejecutarlo en un Mac)
```

Requiere Python 3 con tkinter (el instalador de python.org lo incluye). Al generar la `.app` sin firmar,
macOS puede pedir abrirla con clic derecho > Abrir la primera vez.

## Versión web / iPhone

La carpeta `web/` es una web (PWA) que hace lo mismo desde el navegador del móvil. El cifrado (AES-256, con
[qpdf](https://github.com/qpdf/qpdf) compilado a WebAssembly, incluido en `web/vendor/`) se hace en el propio
dispositivo: el PDF no se envía a ningún servidor.

Probar desde el iPhone (Mac y iPhone en la misma Wi-Fi):

```bash
cd web && python3 -m http.server 8000
# en Safari del iPhone: http://<IP-del-Mac>:8000   (IP: Ajustes > Wi-Fi, o `ipconfig getifaddr en0`)
```

Para publicarla hace falta servirla por **HTTPS** (p. ej. GitHub Pages, Netlify, Cloudflare Pages: basta con
subir la carpeta `web/`). Con HTTPS, en Safari: Compartir > *Añadir a pantalla de inicio* la instala como app,
funciona sin conexión y el botón *Guardar / Compartir* abre la hoja de iOS (Guardar en Archivos, correo, WhatsApp…).
Sin HTTPS, el archivo se descarga directamente.

Si cambias archivos de `web/`, sube `VERSION` en `web/sw.js` para que los móviles actualicen la caché.
