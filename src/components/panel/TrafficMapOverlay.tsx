"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  BRIDGES,
  bridgeEstimatedDensity,
  bridgeEstimatedMin,
} from "@/data/bridges";
import { trafficStatusTr } from "@/lib/traffic-source";
import type { Route as OsrmRoute } from "@/lib/route-source";

type Props = {
  open: boolean;
  onClose: () => void;
  live?: { lng: number; lat: number };
  route?: OsrmRoute | null;
};

export function TrafficMapOverlay({ open, onClose, live, route }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [cityIndex, setCityIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);

  // Canlı trafik endeksi
  useEffect(() => {
    if (!open) return;
    let alive = true;
    const tick = () => {
      fetch("/api/traffic")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (d.source === "ibb") setCityIndex(d.current.index);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [open]);

  useEffect(() => {
    if (open) setVisible(true);
    else {
      const t = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Harita oluştur
  useEffect(() => {
    if (!open || !containerRef.current || mapRef.current) return;

    const isDark = document.documentElement.classList.contains("dark");
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: isDark
        ? "https://tiles.openfreemap.org/styles/dark"
        : "https://tiles.openfreemap.org/styles/positron",
      center: live ? [live.lng, live.lat] : [29.02, 41.05],
      zoom: 10.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    if (live) {
      map.addControl(
        new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true },
          trackUserLocation: true,
        }),
        "top-right"
      );
    }

    map.on("load", () => {
      // Kullanıcı pulse marker'ı
      if (live) {
        const userEl = document.createElement("div");
        userEl.innerHTML = `
          <div style="position:relative; width:34px; height:34px;">
            <div style="position:absolute; inset:0; border-radius:50%;
              background:#2db7ab; opacity:0.35; animation: trafficUserPulse 1.8s ease-out infinite;"></div>
            <div style="position:absolute; inset:8px; border-radius:50%;
              background:#2db7ab; border:2.5px solid #f6f2e9;
              box-shadow:0 3px 8px rgba(10,29,58,0.5);"></div>
          </div>`;
        new maplibregl.Marker({ element: userEl })
          .setLngLat([live.lng, live.lat])
          .addTo(map);
        if (!document.getElementById("__istbam_traffic_pulse")) {
          const s = document.createElement("style");
          s.id = "__istbam_traffic_pulse";
          s.textContent = `@keyframes trafficUserPulse { 0% { transform: scale(0.9); opacity: 0.7; } 70% { transform: scale(1.7); opacity: 0; } 100% { transform: scale(1.7); opacity: 0; } }`;
          document.head.appendChild(s);
        }
      }

      // Rota polyline (eğer aktif rota varsa, trafiğe göre renkli)
      if (route?.geometry?.coordinates?.length) {
        const idx = cityIndex ?? 50;
        const routeColor =
          idx < 30 ? "#2eb872" : idx < 60 ? "#f5a524" : "#c84b4b";

        map.addSource("traffic-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: route.geometry,
          },
        });
        map.addLayer({
          id: "traffic-route-casing",
          type: "line",
          source: "traffic-route",
          paint: {
            "line-color": "#0a1d3a",
            "line-width": 10,
            "line-opacity": 0.5,
          },
        });
        map.addLayer({
          id: "traffic-route-line",
          type: "line",
          source: "traffic-route",
          paint: {
            "line-color": routeColor,
            "line-width": 6,
            "line-opacity": 0.9,
          },
        });
      }

      drawBridges();
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // cityIndex değişince köprü renklerini yenile
  useEffect(() => {
    if (!mapRef.current?.loaded()) return;
    drawBridges();
    // Rota rengini de güncelle
    const map = mapRef.current;
    if (cityIndex != null && map?.getLayer("traffic-route-line")) {
      const routeColor =
        cityIndex < 30
          ? "#2eb872"
          : cityIndex < 60
          ? "#f5a524"
          : "#c84b4b";
      map.setPaintProperty("traffic-route-line", "line-color", routeColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityIndex]);

  function drawBridges() {
    const map = mapRef.current;
    if (!map) return;

    // Eski marker'ları sil
    document
      .querySelectorAll("[data-traffic-bridge='1']")
      .forEach((el) => el.remove());

    BRIDGES.forEach((b) => {
      const density =
        cityIndex == null
          ? null
          : bridgeEstimatedDensity(cityIndex, b.congestionMultiplier);
      const min =
        density == null ? null : bridgeEstimatedMin(b.baseTravelMin, density);
      const color =
        density == null
          ? "#7d8aa3"
          : density < 30
          ? "#2eb872"
          : density < 60
          ? "#f5a524"
          : "#c84b4b";

      const el = document.createElement("div");
      el.setAttribute("data-traffic-bridge", "1");
      el.style.cssText = `
        width: 36px; height: 36px; border-radius: 50%;
        background: ${color};
        border: 3px solid #f6f2e9;
        box-shadow: 0 4px 14px rgba(10,29,58,0.45);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 800; font-size: 14px;
        font-family: var(--font-manrope), system-ui;
        transition: box-shadow .15s ease;
      `;
      el.textContent = b.shortName[0];
      el.title = `${b.name} — ${density ?? "?"}/100`;
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = `0 0 0 10px ${color}44, 0 4px 14px rgba(10,29,58,0.45)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 4px 14px rgba(10,29,58,0.45)";
      });

      el.addEventListener("click", () => {
        const safe = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
        const html = `
          <div style="font-family: var(--font-manrope), system-ui; min-width: 220px;">
            <div style="font-size:9px; font-weight:800; letter-spacing:.08em; color:${color}; text-transform:uppercase;">
              ${density ?? "?"}/100 yoğunluk
            </div>
            <div style="font-size:14px; font-weight:700; color:#0a1d3a; line-height:1.25; margin-top:4px;">
              ${safe(b.name)}
            </div>
            <div style="font-size:12px; color:#3b4b65; margin-top:6px;">
              Tahmini geçiş: <strong>${min ?? "?"} dk</strong> · Ücret: <strong>${b.tollClass1Tl} ₺</strong>
            </div>
            <a href="${b.tariffSourceUrl}" target="_blank" rel="noreferrer"
               style="display:inline-block; margin-top:10px; background:#f5a524; color:#0a1d3a; font-weight:700; font-size:12px; padding:6px 12px; border-radius:999px; text-decoration:none;">
              Resmi tarife ↗
            </a>
          </div>
        `;
        new maplibregl.Popup({
          offset: 18,
          closeButton: true,
          closeOnClick: false,
          maxWidth: "280px",
          className: "istbam-popup",
        })
          .setLngLat([b.lng, b.lat])
          .setHTML(html)
          .addTo(map);
      });

      new maplibregl.Marker({ element: el })
        .setLngLat([b.lng, b.lat])
        .addTo(map);
    });
  }

  if (!visible && !open) return null;

  const status = cityIndex != null ? trafficStatusTr(cityIndex) : null;
  const tone =
    status?.tone === "good"
      ? "text-cini"
      : status?.tone === "warn"
      ? "text-vapur"
      : status?.tone === "bad"
      ? "text-vapur-red"
      : "text-on-mute";

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Trafik haritası"
    >
      <div
        className="absolute inset-0 bg-bogaz-deep/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`absolute inset-3 sm:inset-6 rounded-card overflow-hidden ring-1 ring-line shadow-2xl shadow-bogaz-deep/40 bg-card flex flex-col transition-transform duration-200 ${
          open ? "scale-100" : "scale-[0.97]"
        }`}
      >
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-bogaz-deep text-sis shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-vapur font-semibold">
              Trafik haritası
            </div>
            <div className="font-display font-semibold leading-tight">
              {cityIndex != null && status ? (
                <>
                  Şehir endeksi{" "}
                  <span className={tone}>
                    {cityIndex}/100 · {status.label}
                  </span>
                </>
              ) : (
                "İBB canlı trafik"
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://uym.ibb.gov.tr/yharita6/"
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-vapur-soft transition"
            >
              İBB resmi ↗
            </a>
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-xs font-semibold bg-sis/10 hover:bg-sis/15 ring-1 ring-sis/20 transition"
              aria-label="Kapat"
            >
              ✕ Kapat
            </button>
          </div>
        </header>

        <div ref={containerRef} className="flex-1" />

        <footer className="px-4 py-2 bg-card/95 flex items-center gap-3 text-[11px] text-on-soft border-t border-line">
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-cini" /> Akıcı
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-vapur" /> Yoğun
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-vapur-red" /> Çok yoğun
          </span>
          {route && (
            <span className="ml-auto text-on">
              Rotanın da trafik rengini görüyorsun
            </span>
          )}
          {!route && (
            <span className="ml-auto text-on-mute">
              Hedef seçince rotan da trafiğe göre renklenir
            </span>
          )}
        </footer>
      </div>
    </div>
  );
}
