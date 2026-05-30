"use client";

import { useEffect, useState } from "react";
import { BRAND_OFFICIAL } from "@/lib/fuel-source";
import type { FuelStation } from "@/lib/fuel-source";
import type { LivePrices } from "@/lib/fuel-live";
import { haversineKm } from "@/lib/geo";

type StationWithDist = FuelStation & { distanceKm?: number };

export function FuelCard({
  live,
  destination,
}: {
  live?: { lng: number; lat: number };
  destination?: { lng: number; lat: number; label: string };
}) {
  const [stations, setStations] = useState<StationWithDist[]>([]);
  const [loading, setLoading] = useState(false);
  const [prices, setPrices] = useState<LivePrices | null>(null);
  const ref = live ?? destination;

  // Canlı PO fiyatları
  useEffect(() => {
    let alive = true;
    fetch("/api/fuel-prices")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.source === "PO") setPrices(d as LivePrices);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!ref) return;
    setLoading(true);
    let alive = true;
    fetch(`/api/fuel?lat=${ref.lat}&lng=${ref.lng}&r=1500`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        const items: StationWithDist[] = (d.items ?? [])
          .map((s: FuelStation) => ({
            ...s,
            distanceKm: haversineKm(ref, s),
          }))
          .sort(
            (a: StationWithDist, b: StationWithDist) =>
              (a.distanceKm ?? 99) - (b.distanceKm ?? 99)
          )
          .slice(0, 6);
        setStations(items);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref?.lng, ref?.lat]);

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-semibold">
            ⛽ Akaryakıt
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Bugünkü fiyatlar + yakın istasyonlar
          </h2>
        </div>
        <span
          title="Fiyatlar Petrol Ofisi resmi sayfasından canlı çekiliyor. 6 saatte bir yenilenir."
          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-cini/15 text-cini rounded-full px-2 py-0.5 ring-1 ring-cini/30"
        >
          PO canlı
        </span>
      </header>

      {/* Bugünkü PO İstanbul fiyatları — Avrupa & Anadolu */}
      {prices ? (
        <div className="pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SidePanel
            title="İstanbul · Avrupa"
            prices={prices.istanbulAvrupa}
          />
          <SidePanel
            title="İstanbul · Anadolu"
            prices={prices.istanbulAnadolu}
          />
        </div>
      ) : (
        <div className="pb-3 text-sm text-on-mute">
          PO canlı fiyatları yükleniyor…
        </div>
      )}

      {/* Marka resmi sayfaları */}
      <div className="pb-3">
        <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold mb-1.5">
          Marka anlık fiyatı
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(BRAND_OFFICIAL).map(([brand, url]) => (
            <a
              key={brand}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold rounded-full bg-chip ring-1 ring-line px-2.5 py-1 hover:bg-cini/10 hover:text-cini transition"
            >
              {brand} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Yakın istasyonlar — OSM canlı konum */}
      <div className="pb-3">
        <div className="flex items-baseline justify-between mb-1.5">
          <h3 className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
            Yakındaki istasyonlar
          </h3>
          <span
            title="Veri kaynağı: OpenStreetMap (amenity=fuel) — canlı konum verisi"
            className="text-[9px] uppercase tracking-wider text-cini font-bold"
          >
            OSM canlı
          </span>
        </div>
        {!ref ? (
          <p className="text-xs text-on-mute">
            Konum açıldığında yakın 6 istasyonu listeleyeceğim.
          </p>
        ) : loading && stations.length === 0 ? (
          <p className="text-xs text-on-mute">OSM'den çekiliyor…</p>
        ) : stations.length === 0 ? (
          <p className="text-xs text-on-mute">
            1.5 km içinde kayıtlı istasyon yok.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {stations.map((s) => {
              const brandUrl =
                s.brand && BRAND_OFFICIAL[s.brand]
                  ? BRAND_OFFICIAL[s.brand]
                  : undefined;
              const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;
              return (
                <li
                  key={s.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-card ring-1 ring-line px-3 py-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-on truncate">
                      {s.brand ?? s.name ?? "İstasyon"}
                    </div>
                    <div className="text-[10px] text-on-mute truncate">
                      {s.name && s.brand && s.name !== s.brand
                        ? s.name + " · "
                        : ""}
                      {s.distanceKm != null
                        ? s.distanceKm < 1
                          ? `${Math.round(s.distanceKm * 1000)} m`
                          : `${s.distanceKm.toFixed(1)} km`
                        : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {brandUrl && (
                      <a
                        href={brandUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-cini hover:text-vapur transition"
                        title="Markanın anlık fiyatı"
                      >
                        Fiyat ↗
                      </a>
                    )}
                    <a
                      href={gmaps}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-2.5 py-1 hover:bg-vapur-soft transition"
                    >
                      🧭 Yol
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <footer className="px-1 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-soft">
        <span>
          Fiyat kaynağı:{" "}
          <strong className="text-on">Petrol Ofisi resmi sayfa</strong>
          {prices ? <> · <span className="text-on">{prices.asOf}</span></> : null}
        </span>
        {prices && (
          <a
            href={prices.url}
            target="_blank"
            rel="noreferrer"
            className="font-semibold text-cini hover:text-vapur transition"
          >
            PO sayfası ↗
          </a>
        )}
      </footer>
    </section>
  );
}

function SidePanel({
  title,
  prices,
}: {
  title: string;
  prices: { benzin95?: number; motorin?: number; lpg?: number };
}) {
  return (
    <div className="rounded-xl ring-1 ring-line bg-card/70 backdrop-blur p-3">
      <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold mb-2">
        {title}
      </div>
      <div className="space-y-1.5">
        <PriceRow lbl="Benzin 95" tl={prices.benzin95} />
        <PriceRow lbl="Motorin" tl={prices.motorin} />
        <PriceRow lbl="LPG" tl={prices.lpg} />
      </div>
    </div>
  );
}

function PriceRow({ lbl, tl }: { lbl: string; tl?: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-on-soft">{lbl}</span>
      <span className="font-mono text-sm font-semibold text-on tabular-nums">
        {tl != null ? `${tl.toFixed(2)} ₺` : "—"}
      </span>
    </div>
  );
}

// Eski API uyumlu: PriceTile kullanılmıyor ama dışarıya kapalı, siliyoruz
function _PriceTile({ lbl, tl }: { lbl: string; tl: number }) {
  return (
    <div className="rounded-xl ring-1 ring-line bg-chip px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
        {lbl}
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-on tabular-nums">
        {tl.toFixed(2)}
        <span className="text-sm text-on-mute font-normal ml-1">₺/L</span>
      </div>
    </div>
  );
}
