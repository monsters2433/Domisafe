#!/bin/bash
# Genera "Domisafe PDF.app" (ejecutar en un Mac).
# Requiere Python 3 con tkinter (el instalador de python.org lo incluye).
set -euo pipefail
cd "$(dirname "$0")"

python3 -m venv .venv-build
source .venv-build/bin/activate
pip install -r requirements.txt pyinstaller

pyinstaller --noconfirm --windowed --name "Domisafe PDF" app_mac.py

echo "Listo: dist/Domisafe PDF.app"
