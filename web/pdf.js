// Cifrado/descifrado de PDFs con qpdf (WebAssembly). Todo ocurre en el navegador.
import { normalizar } from "./nif.js";

let scriptCargado;

// qpdf.js define la variable global `Module` (fábrica del módulo wasm).
function cargarScript() {
  scriptCargado ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = new URL("./vendor/qpdf.js", import.meta.url).href;
    s.onload = resolve;
    s.onerror = () => reject(new Error("No se pudo cargar el motor de PDF."));
    document.head.append(s);
  });
  return scriptCargado;
}

// Los PDFs protegidos llevan la entrada /Encrypt en el trailer o en el diccionario del xref.
function estaProtegido(bytes) {
  return new TextDecoder("latin1").decode(bytes).includes("/Encrypt");
}

// Cada operación usa una instancia nueva: qpdf termina el programa al acabar.
// El texto de error de qpdf no es fiable en el navegador; se usa solo el código de salida.
async function ejecutar(bytes, args) {
  await cargarScript();
  const qpdf = await window.Module({
    locateFile: () => new URL("./vendor/qpdf.wasm", import.meta.url).href,
  });
  qpdf.FS.writeFile("/in.pdf", bytes);
  let codigo;
  try {
    codigo = qpdf.callMain([...args, "/in.pdf", "/out.pdf"]);
  } catch (e) {
    codigo = typeof e?.status === "number" ? e.status : 2;
  }
  if (codigo !== 0 && codigo !== 3) return null; // 0 = ok, 3 = ok con avisos
  try {
    return qpdf.FS.readFile("/out.pdf");
  } catch {
    return null;
  }
}

export async function bloquear(bytes, documento) {
  if (estaProtegido(bytes)) throw new Error("El PDF ya está protegido con contraseña.");
  const clave = normalizar(documento);
  const datos = await ejecutar(bytes, ["--encrypt", clave, clave, "256", "--"]);
  if (!datos) throw new Error("No se pudo procesar el PDF. ¿Está dañado?");
  return datos;
}

export async function desbloquear(bytes, documento) {
  if (!estaProtegido(bytes)) throw new Error("El PDF no está protegido.");
  const datos = await ejecutar(bytes, [`--password=${normalizar(documento)}`, "--decrypt"]);
  if (!datos) throw new Error("NIF/CIF incorrecto.");
  return datos;
}
