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

type Props = {
  open: boolean;
  onClose: () => void;
  live?: { lng: number; lat: number };
};

export function TrafficMapOverlay({ open, onClose, live }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [cityIndex, setCityIndex] = useState<number | null>(null);
  const [visible, setVisible] = useState(false);
  const [networkLoaded, setNetworkLoaded] = useState(false);

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
      center: [29.02, 41.05], // İstanbul merkez — trafik için her zaman şehir geneli
      zoom: 10.5,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    map.on("load", () => {
      drawBridges();
      // Yol ağını arka planda yükle (3 MB civarı, gzip ile küçük)
      fetch("/api/road-network")
        .then((r) => r.json())
        .then((nw) => {
          if (!mapRef.current) return;
          if (!nw?.features?.length) return;
          if (mapRef.current.getSource("road-network")) return;

          mapRef.current.addSource("road-network", {
            type: "geojson",
            data: nw,
          });

          // Kontur (kalın koyu)
          mapRef.current.addLayer({
            id: "road-network-casing",
            type: "line",
            source: "road-network",
            paint: {
              "line-color": "#0a1d3a",
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                8,
                ["case", ["==", ["get", "cls"], "motorway"], 5, 3],
                14,
                ["case", ["==", ["get", "cls"], "motorway"], 12, 7],
              ],
              "line-opacity": 0.45,
            },
          });
          // Ana renkli çizgi (cityIndex ile dolacak — applyRoadColor)
          mapRef.current.addLayer({
            id: "road-network-line",
            type: "line",
            source: "road-network",
            paint: {
              "line-color": "#7d8aa3", // başlangıçta gri, sonra cityIndex ile güncellenir
              "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                8,
                ["case", ["==", ["get", "cls"], "motorway"], 3, 2],
                14,
                ["case", ["==", ["get", "cls"], "motorway"], 8, 5],
              ],
              "line-opacity": 0.92,
            },
          });
          setNetworkLoaded(true);
        })
        .catch(() => {});
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // cityIndex değişince hem köprüleri hem yol ağı rengini yenile
  useEffect(() => {
    if (!mapRef.current?.loaded()) return;
    drawBridges();
    applyRoadColor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityIndex, networkLoaded]);

  function applyRoadColor() {
    const map = mapRef.current;
    if (!map || !map.getLayer("road-network-line")) return;
    const color =
      cityIndex == null
        ? "#7d8aa3"
        : cityIndex < 30
        ? "#2eb872"
        : cityIndex < 60
        ? "#f5a524"
        : "#c84b4b";
    map.setPaintProperty("road-network-line", "line-color", color);
  }

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
          <span className="ml-auto text-on-mute">
            Renk = şehir endeksi · Yollar OSM, ağ uniform renkte
          </span>
        </footer>
      </div>
    </div>
  );
}
