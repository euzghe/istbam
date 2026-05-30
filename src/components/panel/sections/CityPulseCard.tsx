"use client";

import { useEffect, useState } from "react";
import { usePanel } from "@/components/panel/PanelContext";
import type { TrafficSnapshot } from "@/lib/traffic-source";
import type { WeatherSnapshot } from "@/lib/weather-source";
import { weatherEmoji } from "@/lib/weather-source";
import { BRIDGES, bridgeEstimatedDensity, bridgeEstimatedMin } from "@/data/bridges";

// "Şehrin Nabzı" — anlık tek bakışta İstanbul:
// trafik, hava, köprü, İSPARK, yakıt. Hepsi gerçek ücretsiz veriler.

type TrafficResp = TrafficSnapshot | { source: "empty"; reason: string };
type WeatherResp = WeatherSnapshot | { source: "empty"; reason: string };
type FuelLivePrice = { benzin95?: number; motorin?: number; lpg?: number };
type FuelResp =
  | { source: "PO"; istanbulAvrupa: FuelLivePrice; istanbulAnadolu: FuelLivePrice }
  | { error: string };

function trafficTone(idx: number): { bg: string; text: string; label: string } {
  if (idx < 30) return { bg: "bg-cini/15", text: "text-cini", label: "Akıcı" };
  if (idx < 55) return { bg: "bg-cini/10", text: "text-cini-soft", label: "Normal" };
  if (idx < 75) return { bg: "bg-vapur/15", text: "text-vapur", label: "Yoğun" };
  return { bg: "bg-vapur-red/15", text: "text-vapur-red", label: "Çok yoğun" };
}

function deltaIcon(d: number): string {
  if (d > 2) return "↑";
  if (d < -2) return "↓";
  return "→";
}

export function CityPulseCard() {
  const { isparks } = usePanel();
  const [traffic, setTraffic] = useState<TrafficResp | null>(null);
  const [weather, setWeather] = useState<WeatherResp | null>(null);
  const [fuel, setFuel] = useState<FuelResp | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/traffic")
      .then((r) => r.json())
      .then((d) => alive && setTraffic(d))
      .catch(() => alive && setTraffic({ source: "empty", reason: "fetch" }));
    fetch("/api/weather")
      .then((r) => r.json())
      .then((d) => alive && setWeather(d))
      .catch(() => alive && setWeather({ source: "empty", reason: "fetch" }));
    fetch("/api/fuel-prices")
      .then((r) => r.json())
      .then((d) => alive && setFuel(d))
      .catch(() => alive && setFuel({ error: "fetch" }));
    return () => {
      alive = false;
    };
  }, []);

  // Trafik
  const trafIdx = traffic && traffic.source === "ibb" ? traffic.current.index : null;
  const trafTone = trafIdx != null ? trafficTone(trafIdx) : null;
  const trafDelta = traffic && traffic.source === "ibb" ? traffic.deltaLast : 0;

  // İSPARK toplam doluluk
  const isparkTotal = isparks.reduce((s, p) => s + p.capacity, 0);
  const isparkEmpty = isparks.reduce((s, p) => s + p.emptyCapacity, 0);
  const isparkFull = isparkTotal - isparkEmpty;
  const isparkPct = isparkTotal > 0 ? Math.round((isparkFull / isparkTotal) * 100) : null;

  // Boğaz köprüleri tahmini doluluk → en akıcı + en doluş
  const bridgeStats =
    trafIdx != null
      ? BRIDGES.map((b) => {
          const density = bridgeEstimatedDensity(trafIdx, b.congestionMultiplier);
          const min = bridgeEstimatedMin(b.baseTravelMin, density);
          return { ...b, density, min };
        }).sort((a, b) => a.density - b.density)
      : [];
  const bestBridge = bridgeStats[0];
  const worstBridge = bridgeStats[bridgeStats.length - 1];

  // Yakıt — Avrupa yakası benzin (en yaygın kullanım)
  const fuelOk = fuel && "source" in fuel && fuel.source === "PO";
  const benzin95 = fuelOk ? fuel.istanbulAvrupa.benzin95 : undefined;
  const motorin = fuelOk ? fuel.istanbulAvrupa.motorin : undefined;

  // Hava
  const w = weather && weather.source === "open-meteo" ? weather : null;

  const isLoading = traffic == null || weather == null || fuel == null;

  return (
    <section className="rounded-card border border-line bg-card overflow-hidden">
      <header className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-vapur font-semibold flex items-center gap-1.5">
            <span className="inline-block size-1.5 rounded-full bg-vapur animate-pulse" />
            Şehrin nabzı
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold leading-tight">
            İstanbul şu an
          </h2>
        </div>
        {isLoading && (
          <span className="text-[10px] uppercase tracking-wider text-on-mute">
            yükleniyor…
          </span>
        )}
      </header>

      {/* Sürücü uyarısı (sis/yağmur/buzlanma/rüzgar) — varsa en üstte */}
      {w?.driverAlert && (
        <div
          className={`mx-5 mb-3 rounded-lg px-3 py-2 text-[12px] ring-1 ${
            w.driverAlert.level === "danger"
              ? "bg-vapur-red/10 ring-vapur-red/30 text-vapur-red"
              : w.driverAlert.level === "warn"
              ? "bg-vapur/15 ring-vapur/30 text-vapur"
              : "bg-cini/10 ring-cini/25 text-cini"
          }`}
        >
          <span className="font-semibold">{weatherEmoji(w.condition)} Sürücü uyarısı:</span>{" "}
          {w.driverAlert.text}
        </div>
      )}

      {/* Büyük trafik göstergesi */}
      <div className="px-5 pb-3">
        <div
          className={`rounded-xl px-4 py-3 flex items-center gap-4 ${
            trafTone ? trafTone.bg : "bg-sis/10"
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest opacity-70 font-bold">
              Trafik endeksi
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span
                className={`font-display text-3xl font-bold tabular-nums ${
                  trafTone?.text ?? "text-on"
                }`}
              >
                {trafIdx ?? "—"}
              </span>
              <span className="text-xs opacity-60">/ 100</span>
              <span className={`text-sm font-semibold ${trafTone?.text ?? ""}`}>
                {trafTone?.label ?? ""}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider opacity-60">
              5 dk değişim
            </div>
            <div className={`text-lg font-bold ${trafTone?.text ?? ""}`}>
              {deltaIcon(trafDelta)} {Math.abs(trafDelta) || 0}
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 mini metrik grid */}
      <div className="px-5 pb-4 grid grid-cols-2 gap-2.5">
        {/* Hava */}
        <div className="rounded-lg bg-sis/5 ring-1 ring-line px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-on-mute font-semibold">
            Hava durumu
          </div>
          {w ? (
            <>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-lg">{weatherEmoji(w.condition)}</span>
                <span className="font-display text-xl font-semibold">{w.tempC}°</span>
                <span className="text-[11px] text-on-soft truncate">{w.conditionLabel}</span>
              </div>
              <div className="text-[10px] text-on-mute mt-0.5">
                Rüzgar {w.windKmh} km/sa
                {w.precipitationMm > 0 && ` · Yağış ${w.precipitationMm}mm`}
              </div>
            </>
          ) : (
            <div className="text-xs text-on-mute mt-1">—</div>
          )}
        </div>

        {/* İSPARK */}
        <div className="rounded-lg bg-sis/5 ring-1 ring-line px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-on-mute font-semibold">
            İSPARK ortalama
          </div>
          {isparkPct != null ? (
            <>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-display text-xl font-semibold tabular-nums">
                  %{isparkPct}
                </span>
                <span className="text-[11px] text-on-soft">dolu</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-sis/15 overflow-hidden">
                <div
                  className={`h-full ${
                    isparkPct < 60
                      ? "bg-cini"
                      : isparkPct < 85
                      ? "bg-vapur"
                      : "bg-vapur-red"
                  }`}
                  style={{ width: `${isparkPct}%` }}
                />
              </div>
            </>
          ) : (
            <div className="text-xs text-on-mute mt-1">{isparks.length ? "—" : "Yükleniyor"}</div>
          )}
        </div>

        {/* En akıcı köprü */}
        <div className="rounded-lg bg-sis/5 ring-1 ring-line px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-on-mute font-semibold">
            En akıcı geçiş
          </div>
          {bestBridge ? (
            <>
              <div className="font-display text-sm font-semibold mt-0.5 truncate">
                🟢 {bestBridge.shortName}
              </div>
              <div className="text-[11px] text-on-soft">
                ~{bestBridge.min} dk · {bestBridge.tollClass1Tl}₺
              </div>
            </>
          ) : (
            <div className="text-xs text-on-mute mt-1">—</div>
          )}
        </div>

        {/* En doluş köprü */}
        <div className="rounded-lg bg-sis/5 ring-1 ring-line px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-wider text-on-mute font-semibold">
            En doluş geçiş
          </div>
          {worstBridge && worstBridge.id !== bestBridge?.id ? (
            <>
              <div className="font-display text-sm font-semibold mt-0.5 truncate">
                🔴 {worstBridge.shortName}
              </div>
              <div className="text-[11px] text-on-soft">
                ~{worstBridge.min} dk · {worstBridge.tollClass1Tl}₺
              </div>
            </>
          ) : (
            <div className="text-xs text-on-mute mt-1">—</div>
          )}
        </div>
      </div>

      {/* Alt: yakıt fiyatı */}
      {(benzin95 || motorin) && (
        <div className="px-5 pb-4">
          <div className="rounded-lg bg-sis/5 ring-1 ring-line px-3 py-2 flex items-center gap-4 text-[12px]">
            <span className="text-[10px] uppercase tracking-wider text-on-mute font-semibold">
              ⛽ İstanbul Avrupa
            </span>
            {benzin95 && (
              <span className="font-semibold">
                Benzin{" "}
                <span className="text-vapur font-mono tabular-nums">
                  {benzin95.toFixed(2)}₺
                </span>
              </span>
            )}
            {motorin && (
              <span className="font-semibold">
                Motorin{" "}
                <span className="text-vapur font-mono tabular-nums">
                  {motorin.toFixed(2)}₺
                </span>
              </span>
            )}
            <span className="ml-auto text-[10px] text-on-mute hidden sm:inline">
              Petrol Ofisi
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
