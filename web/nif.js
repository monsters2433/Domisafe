// Validación de NIF, NIE y CIF (misma lógica que bloquear_pdf.py).
const LETRAS_DNI = "TRWAGMYFPDXBNJZSQVHLCKE";
const LETRAS_CIF = "JABCDEFGHI";

export function normalizar(documento) {
  return documento.replace(/[\s\-.]/g, "").toUpperCase();
}

function nifValido(doc) {
  const m = /^([XYZ]|\d)(\d{7})([A-Z])$/.exec(doc);
  if (!m) return false;
  const [, prefijo, cuerpo, letra] = m;
  const inicio = "XYZ".includes(prefijo) ? String("XYZ".indexOf(prefijo)) : prefijo;
  return LETRAS_DNI[Number(inicio + cuerpo) % 23] === letra;
}

function cifValido(doc) {
  const m = /^([ABCDEFGHJNPQRSUVW])(\d{7})([0-9A-J])$/.exec(doc);
  if (!m) return false;
  const [, tipo, cuerpo, control] = m;
  const digitos = [...cuerpo].map(Number);
  const pares = digitos.filter((_, i) => i % 2 === 1).reduce((a, b) => a + b, 0);
  const impares = digitos
    .filter((_, i) => i % 2 === 0)
    .map((d) => d * 2)
    .reduce((a, b) => a + Math.floor(b / 10) + (b % 10), 0);
  const digito = (10 - ((pares + impares) % 10)) % 10;
  if ("PQRSNW".includes(tipo)) return control === LETRAS_CIF[digito];
  if ("ABEH".includes(tipo)) return control === String(digito);
  return control === String(digito) || control === LETRAS_CIF[digito];
}

export function esDocumentoValido(documento) {
  const doc = normalizar(documento);
  return nifValido(doc) || cifValido(doc);
}
