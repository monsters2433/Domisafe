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
