// Service worker de la app "Inventario El Chinito".
// Guarda la "cáscara" de la app (pantalla de carga, íconos) para que abra
// al instante y muestre un aviso si no hay internet. El sistema en sí
// (Google Apps Script) siempre se carga en línea con datos actualizados.
var VERSION = 'chinito-app-v1';
var ARCHIVOS = [
  './', './index.html', './config.js', './manifest.webmanifest',
  './iconos/icono-192.png', './iconos/icono-512.png', './iconos/logo-splash.png', './iconos/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

// Archivos propios: primero internet (para tomar cambios en config.js), si no hay, la copia guardada.
// Las peticiones a Google (el sistema) no se tocan.
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (resp) {
      var copia = resp.clone();
      caches.open(VERSION).then(function (c) { c.put(req, copia); });
      return resp;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
