/* Base Demo Oficial - SI 0.9.3. Instalação transacional de recursos locais. */
const CACHE = "base-demo-si-v0.9.3";
const FILES = [
  "./", "./index.html", "./app.js", "./app.css", "./workspace.css",
  "./components.css", "./extensions.css", "./education.css", "./records.css",
  "./distribution.css", "./inspection.css", "./completion.css", "./organization.css", "./environment-organization.css", "./menu-fidelity.css", "./menu-review.css", "./home-fidelity.css", "./manifest.webmanifest", "./assets/icon.svg",
  "./assets/icon-192.png", "./assets/icon-512.png", "./assets/apple-touch-icon.png"
];
self.addEventListener("install", event => {
  // addAll falha integralmente caso qualquer recurso esteja ausente.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("base-demo-si-v") && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (event.request.mode === "navigate") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const page = await cache.match(new URL("./index.html", scope).href);
      if (page) return page;
      try { return await fetch(event.request); }
      catch { return new Response("Aplicativo indisponível: cache local não encontrado.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } }); }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request);
    if (cached) return cached;
    return fetch(event.request);
  })());
});
