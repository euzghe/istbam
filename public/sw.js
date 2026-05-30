// İstbam Service Worker
// Strateji:
//  - App shell ve statik asset'ler: cache-first
//  - /api/* (canlı veri): network-first, ağ yoksa cache fallback
//  - Map tile'ları (openfreemap, basemaps): stale-while-revalidate
//  - Diğer GET'ler: cache passthrough

const CACHE = "istbam-v3";
const APP_SHELL = ["/", "/panel"];
const RUNTIME = "istbam-runtime-v3";
const TILES = "istbam-tiles-v3";
const API = "istbam-api-v3";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll(APP_SHELL).catch(() => null)
    )
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      const allowed = new Set([CACHE, RUNTIME, TILES, API]);
      await Promise.all(
        keys.filter((k) => !allowed.has(k)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }

  // chrome-extension vb. atla
  if (!url.protocol.startsWith("http")) return;

  // Canlı veri: network-first
  if (url.origin === location.origin && url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(req, API, 4000));
    return;
  }

  // Map tile sağlayıcıları: stale-while-revalidate
  if (
    url.hostname.endsWith("openfreemap.org") ||
    url.hostname.endsWith("basemaps.cartocdn.com") ||
    url.hostname.endsWith("openstreetmap.org") ||
    url.hostname.endsWith("tile.osm.org")
  ) {
    event.respondWith(staleWhileRevalidate(req, TILES));
    return;
  }

  // Aynı kaynaktan statik (Next chunks, fontlar, ikonlar)
  if (url.origin === location.origin) {
    // HTML sayfaları: network-first ki güncel deploy görülsün
    if (req.mode === "navigate" || req.destination === "document") {
      event.respondWith(networkFirst(req, RUNTIME, 3000));
      return;
    }
    // Statik asset
    event.respondWith(cacheFirst(req, RUNTIME));
    return;
  }

  // Diğer 3rd party (Google Fonts vs.): SWR
  event.respondWith(staleWhileRevalidate(req, RUNTIME));
});

async function networkFirst(req, cacheName, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await Promise.race([
      fetch(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), timeoutMs)),
    ]);
    if (fresh && fresh.ok) {
      cache.put(req, fresh.clone()).catch(() => {});
    }
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) {
      // Çevrimdışı işareti header'ı eklemiyoruz çünkü clone limiti var.
      return cached;
    }
    // Sayfa fallback
    if (req.mode === "navigate") {
      const shell = await caches.match("/panel");
      if (shell) return shell;
    }
    return new Response(
      JSON.stringify({ offline: true, error: "Ağ yok ve cache boş" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      cache.put(req, res.clone()).catch(() => {});
    }
    return res;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// Sürüm geçişinde anında etkin olsun istersek client'tan SKIP_WAITING gönderilebilir
self.addEventListener("message", (e) => {
  if (e.data && e.data.type === "SKIP_WAITING") self.skipWaiting();
});
