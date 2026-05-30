// Aktif geliştirme aşamasında olduğumuz için Service Worker devre dışı.
// Var olan kayıtlar ve cache'ler temizlensin ki eski JS chunk'ları
// kullanıcılara servis edilmesin.

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k).catch(() => {})));
      try {
        await self.registration.unregister();
      } catch (err) {}
      const clients = await self.clients.matchAll({ type: "window" });
      clients.forEach((c) => {
        try {
          if (typeof c.navigate === "function") c.navigate(c.url);
        } catch (err) {}
      });
    })()
  );
});

// Hiçbir fetch'i intercept etmiyoruz — tarayıcı her zaman ağdan çeker.
