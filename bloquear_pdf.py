#!/usr/bin/env python3
"""Bloquea PDFs con el NIF/CIF del cliente como contraseña.

Uso:
    python bloquear_pdf.py bloquear certificado.pdf --nif B12345678
    python bloquear_pdf.py desbloquear certificado_bloqueado.pdf --nif B12345678

Si no se indica --nif, se pide por pantalla (sin mostrarlo).
"""
import argparse
import getpass
import re
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter

LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE"
LETRAS_CIF_CONTROL = "JABCDEFGHI"
CIF_CONTROL_LETRA = set("PQRSNW")  # entidades cuyo control es siempre letra
CIF_CONTROL_NUMERO = set("ABEH")  # entidades cuyo control es siempre número


def normalizar(documento: str) -> str:
    """Quita espacios y guiones y pasa a mayúsculas."""
    return re.sub(r"[\s\-.]", "", documento).upper()


def _nif_valido(doc: str) -> bool:
    m = re.fullmatch(r"([XYZ]|\d)(\d{7})([A-Z])", doc)
    if not m:
        return False
    prefijo, cuerpo, letra = m.groups()
    if prefijo in "XYZ":
        prefijo = str("XYZ".index(prefijo))
    numero = int(prefijo + cuerpo)
    return LETRAS_DNI[numero % 23] == letra


def _cif_valido(doc: str) -> bool:
    m = re.fullmatch(r"([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])", doc)
    if not m:
        return False
    tipo, cuerpo, control = m.groups()
    suma_pares = sum(int(c) for c in cuerpo[1::2])
    suma_impares = sum(sum(divmod(int(c) * 2, 10)) for c in cuerpo[0::2])
    digito = (10 - (suma_pares + suma_impares) % 10) % 10
    if tipo in CIF_CONTROL_LETRA:
        return control == LETRAS_CIF_CONTROL[digito]
    if tipo in CIF_CONTROL_NUMERO:
        return control == str(digito)
    return control in (str(digito), LETRAS_CIF_CONTROL[digito])


def es_documento_valido(documento: str) -> bool:
    doc = normalizar(documento)
    return _nif_valido(doc) or _cif_valido(doc)


def bloquear(origen: Path, destino: Path, documento: str) -> None:
    reader = PdfReader(origen)
    if reader.is_encrypted:
        raise ValueError("El PDF ya está protegido con contraseña.")
    writer = PdfWriter(clone_from=reader)
    writer.encrypt(user_password=normalizar(documento), algorithm="AES-256")
    with open(destino, "wb") as f:
        writer.write(f)


def desbloquear(origen: Path, destino: Path, documento: str) -> None:
    reader = PdfReader(origen)
    if not reader.is_encrypted:
        raise ValueError("El PDF no está protegido.")
    if not reader.decrypt(normalizar(documento)):
        raise ValueError("NIF/CIF incorrecto.")
    writer = PdfWriter(clone_from=reader)
    with open(destino, "wb") as f:
        writer.write(f)


def _pedir_documento(args) -> str:
    return args.nif or getpass.getpass("NIF/CIF del cliente: ")


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = parser.add_subparsers(dest="accion", required=True)
    for nombre, ayuda in (("bloquear", "Protege un PDF con el NIF/CIF"), ("desbloquear", "Quita la protección")):
        p = sub.add_parser(nombre, help=ayuda)
        p.add_argument("pdf", type=Path)
        p.add_argument("--nif", help="NIF/CIF del cliente (si se omite, se pide por pantalla)")
        p.add_argument("-o", "--salida", type=Path, help="Archivo de salida")
    args = parser.parse_args(argv)

    if not args.pdf.is_file():
        print(f"No existe el archivo: {args.pdf}", file=sys.stderr)
        return 1

    documento = _pedir_documento(args)
    if args.accion == "bloquear":
        if not es_documento_valido(documento):
            print("El NIF/CIF no es válido. Revisa los dígitos y la letra de control.", file=sys.stderr)
            return 1
        destino = args.salida or args.pdf.with_name(args.pdf.stem + "_bloqueado.pdf")
        accion = bloquear
    else:
        destino = args.salida or args.pdf.with_name(args.pdf.stem + "_desbloqueado.pdf")
        accion = desbloquear

    try:
        accion(args.pdf, destino, documento)
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 1
    print(f"Listo: {destino}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
