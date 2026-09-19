#!/usr/bin/env node

/**
 * Script de inicialización de la BD.
 * Se ejecuta automáticamente con npm run build (via postbuild).
 * Crea la carpeta data/ si no existe.
 */

const fs = require('fs');
const path = require('path');

const dataDir = path.join(process.cwd(), 'data');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  console.log(`✓ Carpeta data/ creada (permisos 700)`);
} else {
  console.log(`✓ Carpeta data/ ya existe`);
}

// Verifica que la carpeta tiene permisos de escritura
try {
  fs.accessSync(dataDir, fs.constants.W_OK);
  console.log(`✓ Carpeta data/ tiene permisos de escritura`);
} catch {
  console.warn(`⚠ Aviso: data/ podría no tener permisos de escritura`);
}

console.log(`✓ Inicialización completada`);
