/* ============================================================
   sw.js — offline app-shell caching
   ============================================================ */
const CACHE = "lumen-v2";
const SHELL = [
  "./", "./index.html", "./manifest.json",
  "./css/variables.css", "./css/base.css", "./css/components.css", "./css/animations.css",
  "./js/storage.js", "./js/i18n.js", "./js/clock.js", "./js/themes.js", "./js/search.js",
  "./js/bookmarks.js", "./js/widgets.js", "./js/settings.js", "./js/app.js",
  "./icons/icon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Network-first for live data APIs (weather, prayer, crypto, fonts)
  if (url.origin !== location.origin) {
    e.respondWith(fetch(req).catch(() => caches.match(req)));
    return;
  }
  // Cache-first (stale-while-revalidate) for the app shell
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
