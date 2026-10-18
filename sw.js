/* Base Demo Oficial - SI 0.1.0: todos os recursos de execução são locais. */
const CACHE = "base-demo-si-v0.1.0";
const FILES = ["./", "./index.html", "./app.css", "./app.js", "./manifest.webmanifest", "./assets/icon.svg"];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener("activate", event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("base-demo-si-") && key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
});
