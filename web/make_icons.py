"""Genera icon-180.png e icon-512.png (candado blanco sobre azul). Sin dependencias."""
import struct
import zlib
from pathlib import Path


def png(size: int) -> bytes:
    s = size
    azul, blanco = (11, 95, 255), (255, 255, 255)

    def pixel(x, y):
        u, v = x / s, y / s
        # cuerpo del candado
        if 0.30 <= u <= 0.70 and 0.48 <= v <= 0.78:
            return blanco
        # arco: anillo superior
        cx, cy = 0.5, 0.48
        d = ((u - cx) ** 2 + (v - cy) ** 2) ** 0.5
        if v <= 0.48 and 0.13 <= d <= 0.20:
            return blanco
        return azul

    filas = b"".join(b"\x00" + bytes(c for x in range(s) for c in pixel(x, y)) for y in range(s))

    def chunk(tipo, datos):
        c = struct.pack(">I", len(datos)) + tipo + datos
        return c + struct.pack(">I", zlib.crc32(tipo + datos))

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", s, s, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(filas, 9)) + chunk(b"IEND", b""))


for n in (180, 512):
    Path(__file__).with_name(f"icon-{n}.png").write_bytes(png(n))
