"use client";

import { usePanel } from "../PanelContext";

export function RouteStatusCard() {
  const { routeLoading, routeError, destination, live } = usePanel();

  // Sadece hedef + canlı konum varken (ama aktif kavşak henüz yokken) bilgi ver
  if (!destination) return null;
  if (!live) return null;

  if (routeLoading) {
    return (
      <section className="rounded-2xl bg-bogaz text-sis ring-1 ring-cini/30 shadow-md shadow-bogaz-deep/15 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-block size-3 rounded-full border-2 border-cini border-t-transparent animate-spin" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cini font-bold">
              Rota hesaplanıyor
            </div>
            <div className="text-sm text-sis/85 mt-0.5 leading-tight">
              &quot;{destination.label}&quot; için OSRM&apos;den yön bilgileri çekiliyor…
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (routeError) {
    return (
      <section className="rounded-2xl bg-bogaz-deep text-sis ring-1 ring-vapur-red/40 shadow-md shadow-bogaz-deep/30 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="text-vapur-red text-lg leading-none mt-0.5">⚠</span>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest text-vapur-red font-bold">
              Rota alınamadı
            </div>
            <div className="text-sm text-sis font-semibold mt-0.5 leading-tight">
              &quot;{destination.label}&quot; için yön çıkarılamadı
            </div>
            <div className="text-[11px] text-sis/65 mt-1.5 leading-relaxed">
              OSRM şu an yavaş veya cevapsız olabilir. Birkaç saniye sonra
              hedefi tekrar seç.
            </div>
            <div className="text-[10px] text-sis/45 font-mono mt-2 truncate">
              {routeError}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return null;
}
