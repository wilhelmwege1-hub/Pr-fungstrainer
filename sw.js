// Service Worker des Prüfungstrainers – automatisch erzeugt von build.js, nicht von Hand ändern.
const VERSION = '69738bf711';
const CACHE = 'bk-pt-' + VERSION;
const DATEIEN = [
  "./",
  "app.js",
  "fonts/AtkinsonHyperlegible-3dfb9b9a.woff2",
  "fonts/AtkinsonHyperlegible-45959b6c.woff2",
  "fonts/AtkinsonHyperlegible-5e93bb7c.woff2",
  "fonts/AtkinsonHyperlegible-7cd82a7f.woff2",
  "fonts/AtkinsonHyperlegible-ab0f0265.woff2",
  "fonts/AtkinsonHyperlegible-fd943e6c.woff2",
  "fonts/BricolageGrotesque-a4fe79f7.woff2",
  "fonts/BricolageGrotesque-a9723242.woff2",
  "fonts/JetBrainsMono-480c0625.woff2",
  "fonts/JetBrainsMono-ba16536d.woff2",
  "icons/apple-touch-icon.png",
  "icons/favicon-32.png",
  "icons/favicon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/maskable-192.png",
  "icons/maskable-512.png",
  "index.html",
  "inhalte/beratung.js",
  "inhalte/lernfelder.js",
  "inhalte/lf10.js",
  "inhalte/lf13-teil2.js",
  "inhalte/lf13.js",
  "manifest.webmanifest"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(DATEIEN.map(u => new Request(u, { cache: 'reload' })))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('bk-pt-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skipWaiting') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const treffer = await c.match(req, { ignoreSearch: true }) || (req.mode === 'navigate' ? await c.match('index.html') : undefined);
    if (treffer) return treffer;
    try {
      const antwort = await fetch(req);
      if (antwort.ok && url.pathname.endsWith('.html') === false) c.put(req, antwort.clone());
      return antwort;
    } catch (err) {
      return (await c.match('index.html')) || Response.error();
    }
  }));
});
