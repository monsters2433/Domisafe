import { esDocumentoValido } from "./nif.js";
import { bloquear, desbloquear } from "./pdf.js";

const $ = (id) => document.getElementById(id);
const entrada = $("pdf");
const botones = [$("bloquear"), $("desbloquear")];
let resultado = null; // { blob, nombre }

function mostrar(texto, clase = "") {
  $("estado").textContent = texto;
  $("estado").className = clase;
}

function limpiarResultado() {
  resultado = null;
  $("guardar").hidden = true;
}

$("elegir").addEventListener("click", () => entrada.click());
entrada.addEventListener("change", () => {
  limpiarResultado();
  mostrar("");
  $("archivo").textContent = entrada.files[0]?.name ?? "Ningún PDF seleccionado";
});

async function procesar(accion, sufijo) {
  const archivo = entrada.files[0];
  const documento = $("nif").value;
  if (!archivo) return mostrar("Primero selecciona un PDF.", "error");
  if (!documento.trim()) return mostrar("Escribe el NIF/CIF del cliente.", "error");
  if (accion === bloquear && !esDocumentoValido(documento)) {
    return mostrar("NIF/CIF no válido. Revisa los dígitos y la letra de control.", "error");
  }

  limpiarResultado();
  botones.forEach((b) => (b.disabled = true));
  mostrar("Procesando…");
  try {
    const datos = await accion(new Uint8Array(await archivo.arrayBuffer()), documento);
    const nombre = archivo.name.replace(/\.pdf$/i, "") + sufijo + ".pdf";
    resultado = { blob: new Blob([datos], { type: "application/pdf" }), nombre };
    $("guardar").hidden = false;
    mostrar(`Listo: ${nombre}`, "ok");
  } catch (e) {
    mostrar(e.message, "error");
  } finally {
    botones.forEach((b) => (b.disabled = false));
  }
}

$("bloquear").addEventListener("click", () => procesar(bloquear, "_bloqueado"));
$("desbloquear").addEventListener("click", () => procesar(desbloquear, "_desbloqueado"));

// En iPhone, la hoja de compartir permite "Guardar en Archivos", enviar por correo, WhatsApp, etc.
// Requiere HTTPS; si no está disponible se descarga el archivo directamente.
$("guardar").addEventListener("click", async () => {
  if (!resultado) return;
  const archivo = new File([resultado.blob], resultado.nombre, { type: "application/pdf" });
  try {
    if (navigator.canShare?.({ files: [archivo] })) {
      await navigator.share({ files: [archivo] });
      return;
    }
  } catch (e) {
    if (e.name === "AbortError") return; // el usuario cerró la hoja
  }
  const url = URL.createObjectURL(resultado.blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: resultado.nombre });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
});

if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});
