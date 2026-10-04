#!/usr/bin/env python3
"""Domisafe PDF: ventana para bloquear y desbloquear PDFs con el NIF/CIF del cliente."""
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

import bloquear_pdf as core


class App(ttk.Frame):
    def __init__(self, master):
        super().__init__(master, padding=20)
        self.pdf = None
        self.nif = tk.StringVar()
        self.archivo = tk.StringVar(value="Ningún PDF seleccionado")
        self.estado = tk.StringVar()

        self.grid(sticky="nsew")
        master.columnconfigure(0, weight=1)
        master.rowconfigure(0, weight=1)
        self.columnconfigure(0, weight=1)

        ttk.Label(self, text="1. Elige el PDF").grid(sticky="w")
        ttk.Button(self, text="Seleccionar PDF…", command=self.elegir_pdf).grid(row=1, sticky="w", pady=(4, 0))
        ttk.Label(self, textvariable=self.archivo, wraplength=420, foreground="gray").grid(row=2, sticky="w", pady=(4, 14))

        ttk.Label(self, text="2. NIF / CIF del cliente").grid(row=3, sticky="w")
        entrada = ttk.Entry(self, textvariable=self.nif, show="•", width=30)
        entrada.grid(row=4, sticky="w", pady=(4, 14))
        entrada.focus()

        botones = ttk.Frame(self)
        botones.grid(row=5, sticky="w")
        ttk.Button(botones, text="Bloquear", command=self.bloquear).pack(side="left")
        ttk.Button(botones, text="Desbloquear", command=self.desbloquear).pack(side="left", padx=8)

        ttk.Label(self, textvariable=self.estado, wraplength=420).grid(row=6, sticky="w", pady=(14, 0))

    def elegir_pdf(self):
        ruta = filedialog.askopenfilename(title="Elige un PDF", filetypes=[("PDF", "*.pdf")])
        if ruta:
            self.pdf = Path(ruta)
            self.archivo.set(str(self.pdf))
            self.estado.set("")

    def _ejecutar(self, accion, sufijo):
        if not self.pdf:
            messagebox.showwarning("Falta el PDF", "Primero selecciona un PDF.")
            return
        documento = self.nif.get()
        if not documento.strip():
            messagebox.showwarning("Falta el NIF/CIF", "Escribe el NIF/CIF del cliente.")
            return
        if accion is core.bloquear and not core.es_documento_valido(documento):
            messagebox.showerror("NIF/CIF no válido", "Revisa los dígitos y la letra de control.")
            return
        destino = filedialog.asksaveasfilename(
            title="Guardar como",
            initialdir=self.pdf.parent,
            initialfile=self.pdf.stem + sufijo + ".pdf",
            defaultextension=".pdf",
            filetypes=[("PDF", "*.pdf")],
        )
        if not destino:
            return
        try:
            accion(self.pdf, Path(destino), documento)
        except ValueError as e:
            messagebox.showerror("No se pudo completar", str(e))
            return
        except Exception as e:  # PDF corrupto, sin permisos, etc.
            messagebox.showerror("Error", f"No se pudo procesar el PDF:\n{e}")
            return
        self.estado.set(f"Listo: {destino}")

    def bloquear(self):
        self._ejecutar(core.bloquear, "_bloqueado")

    def desbloquear(self):
        self._ejecutar(core.desbloquear, "_desbloqueado")


def main():
    root = tk.Tk()
    root.title("Domisafe PDF")
    root.minsize(480, 300)
    App(root)
    root.mainloop()


if __name__ == "__main__":
    main()
