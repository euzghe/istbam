"use client";

import { useEffect, useRef, useState } from "react";
import { usePanel } from "../PanelContext";
import { haversineKm } from "@/lib/geo";
import type { RoadInfo, SpeedCamera } from "@/lib/road-source";

export function SpeedWidget() {
  const { live } = usePanel();
  const [speedKmh, setSpeedKmh] = useState<number | null>(null);
  const [road, setRoad] = useState<RoadInfo | null>(null);
  const [cameras, setCameras] = useState<SpeedCamera[]>([]);
  const lastFetchRef = useRef<{ lng: number; lat: number; at: number } | null>(
    null
  );
  const lastCameraWarnRef = useRef<string | null>(null);

  // Tarayıcı geolocation watchPosition zaten PanelShell'de, hıza erişim için ek
  // bir watch açıyoruz çünkü `live` state'inde speed alanı yok.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        if (pos.coords.speed != null && pos.coords.speed >= 0) {
          // m/s → km/h
          setSpeedKmh(Math.max(0, Math.round(pos.coords.speed * 3.6)));
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // Yol & kamera fetch — kullanıcı 200m hareket ettiğinde veya 30sn'de bir
  useEffect(() => {
    if (!live) return;
    const now = Date.now();
    const last = lastFetchRef.current;
    const moved = last
      ? haversineKm({ lng: live.lng, lat: live.lat }, last) * 1000
      : Infinity;
    const elapsed = last ? now - last.at : Infinity;
    if (moved < 200 && elapsed < 30_000) return;

    lastFetchRef.current = { lng: live.lng, lat: live.lat, at: now };
    let alive = true;
    fetch(`/api/road?lat=${live.lat}&lng=${live.lng}`)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setRoad(d.road ?? null);
        setCameras(d.cameras ?? []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [live?.lng, live?.lat]);

  // Yaklaşan kamera — en yakın 500m içinde olan
  const closestCamera = (() => {
    if (!live || cameras.length === 0) return null;
    let best: { cam: SpeedCamera; distM: number } | null = null;
    for (const cam of cameras) {
      const distM = haversineKm(live, cam) * 1000;
      if (!best || distM < best.distM) best = { cam, distM };
    }
    return best && best.distM < 800 ? best : null;
  })();

  // Kamera ses uyarısı (300m içinde, ilk seferinde söyle)
  useEffect(() => {
    if (!closestCamera || closestCamera.distM > 350) return;
    const camKey = closestCamera.cam.id;
    if (lastCameraWarnRef.current === camKey) return;
    lastCameraWarnRef.current = camKey;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        const text = `Dikkat. ${Math.round(closestCamera.distM)} metre sonra hız kamerası.`;
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "tr-TR";
        u.rate = 1.05;
        window.speechSynthesis.speak(u);
      } catch {}
    }
  }, [closestCamera]);

  // Limit aşımı tonu
  const limit = road?.maxSpeedKmh;
  const over =
    speedKmh != null && limit != null ? speedKmh - limit : 0;
  const tone = over > 10 ? "vapur-red" : over > 0 ? "vapur" : "cini";
  const toneColor = {
    cini: "text-cini",
    vapur: "text-vapur",
    "vapur-red": "text-vapur-red",
  }[tone];
  const toneRing = {
    cini: "ring-cini/30",
    vapur: "ring-vapur/40",
    "vapur-red": "ring-vapur-red/40",
  }[tone];

  // Hiçbir veri yoksa kart gizli
  if (!live) return null;
  if (speedKmh == null && limit == null && !closestCamera) return null;

  return (
    <section
      className={`rounded-2xl bg-card/70 backdrop-blur ring-1 ${toneRing} shadow-sm overflow-hidden`}
    >
      <div className="px-4 py-3 grid grid-cols-2 gap-3 items-center">
        {/* Mevcut hız */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
            Hızım
          </div>
          <div
            className={`font-display text-3xl font-semibold tabular-nums leading-none mt-0.5 ${toneColor}`}
          >
            {speedKmh != null ? speedKmh : "—"}
            <span className="text-sm text-on-mute font-normal ml-1">km/h</span>
          </div>
        </div>

        {/* Hız limiti */}
        <div>
          <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
            Limit
          </div>
          {limit != null ? (
            <div className="mt-0.5 inline-flex items-center justify-center size-12 rounded-full bg-card ring-4 ring-vapur-red font-display text-lg font-bold text-on">
              {limit}
            </div>
          ) : (
            <div className="text-sm text-on-mute mt-1">—</div>
          )}
          {road?.roadName && (
            <div className="text-[10px] text-on-mute mt-1 truncate">
              {road.roadRef ? `${road.roadRef} · ` : ""}
              {road.roadName}
            </div>
          )}
        </div>
      </div>

      {/* Limit aşım uyarı bandı */}
      {over > 0 && limit != null && (
        <div className="bg-vapur-red text-sis px-4 py-1.5 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-sis animate-pulse" />
          Limit aşıldı · +{over} km/h
        </div>
      )}

      {/* Yaklaşan hız kamerası */}
      {closestCamera && (
        <div className="bg-bogaz-deep text-sis px-4 py-2 text-[11px] flex items-center gap-2">
          <span className="text-vapur text-base">📷</span>
          <span className="font-semibold">
            {Math.round(closestCamera.distM)} m sonra hız kamerası
            {closestCamera.cam.maxspeed
              ? ` · limit ${closestCamera.cam.maxspeed}`
              : ""}
          </span>
        </div>
      )}
    </section>
  );
}
