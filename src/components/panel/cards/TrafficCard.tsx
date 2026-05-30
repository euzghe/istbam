"use client";

import { useEffect, useState } from "react";
import type { TrafficSnapshot } from "@/lib/traffic-source";
import { trafficStatusTr } from "@/lib/traffic-source";
import {
  BRIDGES,
  bridgeEstimatedDensity,
  bridgeEstimatedMin,
} from "@/data/bridges";

type State = TrafficSnapshot | "loading" | "error";

export function TrafficCard() {
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let alive = true;
    const tick = () => {
      fetch("/api/traffic")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (d.source === "ibb") setState(d as TrafficSnapshot);
          else setState("error");
        })
        .catch(() => alive && setState("error"));
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const cityIndex =
    state === "loading" || state === "error" ? null : state.current.index;

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-semibold">
            🚦 İstanbul Trafiği · Boğaz Geçişleri
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Şehir yoğunluğu · köprü ücretleri
          </h2>
        </div>
        <span
          title="Şehir geneli yoğunluk: İBB TKM canlı (5 dk). Per-köprü yoğunluk açık API'sı yok — tahmini."
          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-cini/15 text-cini rounded-full px-2 py-0.5 ring-1 ring-cini/30"
        >
          İBB canlı
        </span>
      </header>

      {state === "loading" ? (
        <div className="text-sm text-on-mute px-1">Trafik İndeksi alınıyor…</div>
      ) : state === "error" ? (
        <div className="text-sm text-on-mute px-1">
          İBB API şu an cevap vermiyor; birazdan tekrar denenecek.
        </div>
      ) : (
        <CityIndex snap={state} />
      )}

      <BridgesTable cityIndex={cityIndex} />

      <footer className="px-1 pt-3 mt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-soft">
        <span>
          Şehir endeksi: İBB TKM canlı · Köprü ücretleri: 2026 tarifesi (kontrol et)
        </span>
        <a
          href="https://uym.ibb.gov.tr/yharita6/"
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-cini hover:text-vapur transition"
        >
          Resmi canlı harita ↗
        </a>
      </footer>
    </section>
  );
}

function CityIndex({ snap }: { snap: TrafficSnapshot }) {
  const status = trafficStatusTr(snap.current.index);
  const color =
    status.tone === "good"
      ? "text-cini"
      : status.tone === "warn"
      ? "text-vapur"
      : "text-vapur-red";
  const bg =
    status.tone === "good"
      ? "bg-cini"
      : status.tone === "warn"
      ? "bg-vapur"
      : "bg-vapur-red";
  const dirArrow =
    snap.deltaLast > 1 ? "↑" : snap.deltaLast < -1 ? "↓" : "→";
  const dirColor =
    snap.deltaLast > 1
      ? "text-vapur-red"
      : snap.deltaLast < -1
      ? "text-cini"
      : "text-on-mute";

  return (
    <div className="rounded-2xl bg-card ring-1 ring-line shadow-md shadow-bogaz-deep/10 px-5 py-4 mb-4">
      <div className="flex items-end gap-4">
        <div>
          <div
            className={`font-display text-4xl font-semibold ${color} leading-none tabular-nums`}
          >
            {snap.current.index}
            <span className="text-base text-on-mute font-normal">/100</span>
          </div>
          <div
            className={`mt-1 text-[10px] font-semibold uppercase tracking-widest ${color}`}
          >
            {status.label}
          </div>
        </div>
        <div className="ml-auto text-right">
          <div className={`text-sm font-semibold ${dirColor}`}>
            {dirArrow} {snap.deltaLast > 0 ? "+" : ""}
            {snap.deltaLast}
          </div>
          <div className="text-[10px] text-on-mute uppercase tracking-wider">
            Son 5 dk
          </div>
          <div className="text-[10px] text-on-mute mt-1">
            Saatlik ort: <strong className="text-on">{snap.hourAvg}</strong>
          </div>
        </div>
      </div>

      <div className="mt-2">
        <Sparkline readings={snap.recent} barClass={bg} />
        <div className="mt-1 flex justify-between text-[10px] text-on-mute">
          <span>60 dk önce</span>
          <span>şu an · {fmtTime(snap.current.at)}</span>
        </div>
      </div>
    </div>
  );
}

function BridgesTable({ cityIndex }: { cityIndex: number | null }) {
  return (
    <div className="px-1">
      <div className="flex items-baseline justify-between mb-2">
        <h3 className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
          Boğaz geçişleri · 1. sınıf araç
        </h3>
        <span
          className="text-[9px] uppercase tracking-wider text-mehtap"
          title="Per-köprü canlı yoğunluk için açık API yok. Tahmini değer, şehir geneli endeksinden hesaplanıyor."
        >
          Yoğunluk tahmini
        </span>
      </div>
      <ul className="space-y-1.5">
        {BRIDGES.map((b) => {
          const density =
            cityIndex == null
              ? null
              : bridgeEstimatedDensity(cityIndex, b.congestionMultiplier);
          const min =
            density == null
              ? null
              : bridgeEstimatedMin(b.baseTravelMin, density);
          const c =
            density == null
              ? "bg-line"
              : density < 30
              ? "bg-cini"
              : density < 60
              ? "bg-vapur"
              : "bg-vapur-red";
          return (
            <li
              key={b.id}
              className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-line px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-on truncate">
                  {b.shortName}
                </div>
                <div className="text-[10px] text-on-mute truncate">
                  {b.operator}
                </div>
              </div>
              <div className="w-28 hidden sm:block">
                <div className="h-1.5 rounded-full bg-line overflow-hidden">
                  <div
                    className={`h-full ${c} transition-all`}
                    style={{ width: `${density ?? 0}%` }}
                  />
                </div>
                <div className="text-[10px] text-on-mute mt-0.5 text-right">
                  {min != null ? `~${min} dk` : "—"}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-sm font-semibold text-on tabular-nums">
                  {b.tollClass1Tl} ₺
                </div>
                <a
                  href={b.tariffSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] uppercase tracking-wider text-cini hover:text-vapur transition"
                >
                  Resmi ↗
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Sparkline({
  readings,
  barClass,
}: {
  readings: { index: number; at: string }[];
  barClass: string;
}) {
  if (!readings.length) return null;
  const ordered = [...readings].reverse();
  const max = Math.max(...ordered.map((r) => r.index), 1);
  return (
    <div className="h-10 flex items-end gap-0.5">
      {ordered.map((r) => {
        const h = Math.max(6, Math.round((r.index / Math.max(60, max)) * 100));
        return (
          <div
            key={r.at}
            className={`flex-1 ${barClass} rounded-sm opacity-80 hover:opacity-100 transition`}
            style={{ height: `${Math.min(100, h)}%` }}
            title={`${fmtTime(r.at)} · ${r.index}`}
          />
        );
      })}
    </div>
  );
}

function fmtTime(iso: string) {
  const m = iso.match(/T(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : iso;
}
