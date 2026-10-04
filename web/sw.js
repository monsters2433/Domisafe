// Caché para que la app funcione sin conexión. Sube VERSION al cambiar archivos.
const VERSION = "domisafe-pdf-v2";
const ARCHIVOS = [
  "./", "index.html", "app.js", "nif.js", "pdf.js", "manifest.webmanifest",
  "vendor/qpdf.js", "vendor/qpdf.wasm", "icon-180.png", "icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
