"use client";

import { useEffect, useState } from "react";
import type { TrafficSnapshot } from "@/lib/traffic-source";
import { BRIDGES, bridgeEstimatedDensity, bridgeEstimatedMin } from "@/data/bridges";

// Anadolu ↔ Avrupa geçişi — yan yana 4 alternatif (3 köprü + Avrasya tüneli)
// anlık tahmini süre + ücret + yoğunluk renk kodu. İstanbullular bu kararı
// günde 1-2 kez veriyor, hiçbir uygulama göstermiyor.

type TrafficResp = TrafficSnapshot | { source: "empty"; reason: string };

function densityTone(d: number): { dot: string; bar: string; text: string } {
  if (d < 35) return { dot: "bg-cini", bar: "bg-cini", text: "text-cini" };
  if (d < 60) return { dot: "bg-vapur", bar: "bg-vapur", text: "text-vapur" };
  return { dot: "bg-vapur-red", bar: "bg-vapur-red", text: "text-vapur-red" };
}

function densityLabel(d: number): string {
  if (d < 35) return "Akıcı";
  if (d < 60) return "Orta";
  return "Yoğun";
}

export function BogazCrossingCard() {
  const [traffic, setTraffic] = useState<TrafficResp | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/traffic")
      .then((r) => r.json())
      .then((d) => alive && setTraffic(d))
      .catch(() => alive && setTraffic({ source: "empty", reason: "fetch" }));
    return () => {
      alive = false;
    };
  }, []);

  const cityIdx = traffic && traffic.source === "ibb" ? traffic.current.index : null;

  // Her köprü için tahmin + ucuzluk/hız puanı
  const rows = BRIDGES.map((b) => {
    const density =
      cityIdx != null ? bridgeEstimatedDensity(cityIdx, b.congestionMultiplier) : 50;
    const minTravel = bridgeEstimatedMin(b.baseTravelMin, density);
    // Basit puan: ucuzluk + hız ağırlıklı. Sadece sıralama için.
    const score = minTravel + b.tollClass1Tl / 10;
    return { ...b, density, minTravel, score };
  });

  // Önerilen: en düşük score (hız+maliyet dengeli)
  const best = [...rows].sort((a, b) => a.score - b.score)[0];

  return (
    <section className="rounded-card border border-line bg-card overflow-hidden">
      <header className="px-5 pt-4 pb-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-cini-soft font-semibold flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-cini animate-pulse" />
            Boğaz geçişi
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
            Şu an hangisini seçsem?
          </h2>
          <p className="text-xs text-on-soft mt-0.5">
            {cityIdx != null
              ? `Şehir trafiği ${cityIdx}/100 · tahminler buna göre`
              : "Trafik verisi yükleniyor"}
          </p>
        </div>
      </header>

      {best && (
        <div className="mx-5 mb-3 rounded-lg bg-vapur text-bogaz-deep px-3 py-2 text-[12px] flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">
            Önerim
          </span>
          <span className="font-display text-base font-semibold">
            {best.shortName}
          </span>
          <span className="opacity-80">
            ~{best.minTravel} dk · {best.tollClass1Tl}₺
          </span>
        </div>
      )}

      <div className="px-5 pb-4 space-y-2">
        {rows.map((r) => {
          const tone = densityTone(r.density);
          const isBest = best?.id === r.id;
          return (
            <a
              key={r.id}
              href={r.tariffSourceUrl}
              target="_blank"
              rel="noreferrer"
              className={`block rounded-xl px-3 py-2.5 transition ${
                isBest
                  ? "bg-cini/8 ring-2 ring-cini/40"
                  : "bg-sis/5 ring-1 ring-line hover:bg-sis/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`inline-block size-2.5 rounded-full ${tone.dot} shrink-0`} />
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold truncate">
                    {r.name}
                  </div>
                  <div className="text-[11px] text-on-mute">
                    {r.operator} · normal {r.baseTravelMin} dk
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-base tabular-nums">
                      {r.minTravel}
                    </span>
                    <span className="text-[10px] text-on-mute">dk</span>
                  </div>
                  <div className="text-[11px] text-on-soft font-semibold">
                    {r.tollClass1Tl}₺
                  </div>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-sis/10 overflow-hidden">
                  <div
                    className={`h-full ${tone.bar}`}
                    style={{ width: `${r.density}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${tone.text}`}>
                  {densityLabel(r.density)} · {r.density}
                </span>
              </div>
            </a>
          );
        })}
      </div>

      <footer className="px-5 pb-3 text-[10px] text-on-mute">
        Süre tahminleri şehir trafik endeksi + köprü çarpanından türetilir.
        Ücretler resmi 2026 tarifeleri.
      </footer>
    </section>
  );
}
