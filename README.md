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
