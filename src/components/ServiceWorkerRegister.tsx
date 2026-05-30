"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegister() {
  const [online, setOnline] = useState(true);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined") return;
    setOnline(navigator.onLine);
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;

    const isDev =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.endsWith(".local"));

    // DEV: SW'yi kayıt etme. Önceki dev sürümünden kalan SW + cache varsa
    // temizle ki bayatlamış chunk hatası ("module factory is not available") olmasın.
    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((r) => r.unregister().catch(() => {}));
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k).catch(() => {}));
        });
      }
      return;
    }

    // PROD: SW kayıt
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then((reg) => {
        if (reg.waiting) setUpdated(true);
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              setUpdated(true);
            }
          });
        });
      })
      .catch(() => {});
  }, []);

  function refresh() {
    navigator.serviceWorker.controller?.postMessage({ type: "SKIP_WAITING" });
    location.reload();
  }

  if (online && !updated) return null;

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-bogaz-deep text-sis ring-1 ring-vapur/30 shadow-lg shadow-bogaz-deep/40 px-4 py-2 text-xs">
      {!online ? (
        <>
          <span className="size-2 rounded-full bg-vapur-red animate-pulse" />
          <span>
            <strong className="text-vapur">Çevrimdışısın.</strong>{" "}
            Son alınan veriyle çalışıyorsun.
          </span>
        </>
      ) : updated ? (
        <>
          <span className="size-2 rounded-full bg-cini animate-pulse" />
          <span>Yeni sürüm hazır.</span>
          <button
            onClick={refresh}
            className="ml-1 rounded-full bg-vapur text-bogaz-deep font-semibold px-2.5 py-1 text-[11px] hover:bg-vapur-soft transition"
          >
            Yenile
          </button>
        </>
      ) : null}
    </div>
  );
}
