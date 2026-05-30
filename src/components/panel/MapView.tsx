"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { IsparkLive } from "@/lib/ispark-source";

type Props = {
  isparks: IsparkLive[];
  focus?: { lng: number; lat: number; zoom?: number };
  onSelectIspark?: (id: number) => void;
  selectedIsparkId?: number;
  // Canlı kullanıcı konumu — pulse marker olarak gösterilir
  live?: { lng: number; lat: number };
};

const ISTANBUL_CENTER: [number, number] = [29.0, 41.025];

export function MapView({
  isparks,
  focus,
  onSelectIspark,
  selectedIsparkId,
  live,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const isparkMarkers = useRef<Map<number, maplibregl.Marker>>(new Map());
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Harita kurulumu (bir kez)
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const isDark =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark");

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: isDark
        ? "https://tiles.openfreemap.org/styles/dark"
        : "https://tiles.openfreemap.org/styles/positron",
      center: ISTANBUL_CENTER,
      zoom: 11.2,
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    mapRef.current = map;

    // Kavşak marker'larını kaldırdık — artık tüm yönlendirme OSRM rotasından
    // canlı olarak geliyor, sabit kavşak listesi yok.

    return () => {
      map.remove();
      mapRef.current = null;
      isparkMarkers.current.clear();
    };
  }, []);

  // İSPARK marker'ları (isparks değişince yeniden çiz)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      // Eski markerları temizle
      isparkMarkers.current.forEach((m) => m.remove());
      isparkMarkers.current.clear();

      // Tek popup kullan — biri açıkken diğeri açılınca öncekini kapat
      let activePopup: maplibregl.Popup | null = null;

      isparks.forEach((p) => {
        const pct = p.capacity
          ? Math.round(((p.capacity - p.emptyCapacity) / p.capacity) * 100)
          : 0;
        const color =
          pct >= 90 ? "#c84b4b" : pct >= 65 ? "#f5a524" : "#2db7ab";
        const colorRgb =
          pct >= 90 ? "200,75,75" : pct >= 65 ? "245,165,36" : "45,183,171";
        const status =
          p.emptyCapacity === 0
            ? "Tamamen dolu"
            : pct >= 90
            ? "Neredeyse dolu"
            : pct >= 65
            ? "Yarı dolu"
            : pct >= 30
            ? "Boş yer var"
            : "Bol boş";

        const el = document.createElement("div");
        el.style.cssText = `
          width: 22px; height: 22px; border-radius: 50%;
          background: ${color};
          border: 2.5px solid #f6f2e9;
          box-shadow: 0 3px 6px rgba(10,29,58,0.35);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #0a1d3a; font-weight: 800; font-size: 11px;
          font-family: var(--font-manrope), system-ui;
          transition: box-shadow .18s ease;
          will-change: box-shadow;
        `;
        el.textContent = "P";
        el.title = `${p.name} — ${p.emptyCapacity}/${p.capacity} boş (${status})`;

        const haloOn = () => {
          el.style.boxShadow = `0 0 0 8px rgba(${colorRgb},0.22), 0 3px 8px rgba(10,29,58,0.45)`;
        };
        const haloOff = () => {
          el.style.boxShadow = "0 3px 6px rgba(10,29,58,0.35)";
        };
        el.addEventListener("mouseenter", haloOn);
        el.addEventListener("mouseleave", haloOff);

        el.addEventListener("click", (ev) => {
          ev.stopPropagation();
          onSelectIspark?.(p.id);

          // HTML popup içeriği
          const safe = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
          const yandex = `https://yandex.com.tr/harita/?rtext=~${p.lat},${p.lng}&rtt=auto`;

          const html = `
            <div style="font-family: var(--font-manrope), system-ui; min-width: 220px;">
              <div style="font-size:9px; font-weight:800; letter-spacing:.08em; color:${color}; text-transform:uppercase;">
                İSPARK · ${safe(p.district)}
              </div>
              <div style="font-size:14px; font-weight:700; color:#0a1d3a; line-height:1.25; margin-top:4px;">
                ${safe(p.name)}
              </div>
              <div style="display:flex; align-items:center; gap:10px; margin-top:8px;">
                <span style="font-family:ui-monospace,monospace; font-size:13px; color:#0a1d3a; font-weight:600;">
                  ${p.emptyCapacity} <span style="color:#6f7c92; font-weight:400;">boş / ${p.capacity}</span>
                </span>
                <span style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:${color};">
                  ${status}
                </span>
              </div>
              <div style="display:flex; gap:6px; margin-top:10px;">
                <a href="${gmaps}" target="_blank" rel="noreferrer"
                   style="flex:1; text-align:center; background:#f5a524; color:#0a1d3a; font-weight:700; font-size:12px; padding:8px 10px; border-radius:999px; text-decoration:none;">
                  🧭 Yol tarifi
                </a>
                <a href="${yandex}" target="_blank" rel="noreferrer"
                   title="Yandex Harita"
                   style="text-align:center; background:#0a1d3a; color:#f6f2e9; font-size:12px; padding:8px 10px; border-radius:999px; text-decoration:none;">
                  Yandex
                </a>
              </div>
            </div>
          `;

          activePopup?.remove();
          activePopup = new maplibregl.Popup({
            offset: 14,
            closeButton: true,
            closeOnClick: false,
            maxWidth: "280px",
            className: "istbam-popup",
          })
            .setLngLat([p.lng, p.lat])
            .setHTML(html)
            .addTo(map);
        });

        const m = new maplibregl.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .addTo(map);
        isparkMarkers.current.set(p.id, m);
      });
    };

    if (map.loaded()) draw();
    else map.on("load", draw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isparks]);

  // Focus değişince uç
  useEffect(() => {
    if (!mapRef.current || !focus) return;
    mapRef.current.flyTo({
      center: [focus.lng, focus.lat],
      zoom: focus.zoom ?? 14,
      duration: 1100,
      essential: true,
    });
  }, [focus?.lng, focus?.lat, focus?.zoom]);

  // Seçili İSPARK vurgu — sadece outline ile, boyutla değil (yerinden oynamasın)
  useEffect(() => {
    isparkMarkers.current.forEach((m, id) => {
      const el = m.getElement();
      if (id === selectedIsparkId) {
        el.style.outline = "3px solid #0a1d3a";
        el.style.outlineOffset = "2px";
      } else {
        el.style.outline = "none";
        el.style.outlineOffset = "0";
      }
    });
  }, [selectedIsparkId, isparks]);

  // Kullanıcı (canlı) konum pulse marker'ı — sadece konumu güncelle, marker'ı yok etme
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!live) {
      // konum kapandıysa marker'ı kaldır
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }

    const apply = () => {
      if (!userMarkerRef.current) {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative; width:30px; height:30px;">
            <div style="position:absolute; inset:0; border-radius:50%;
              background:#2db7ab; opacity:0.35; animation: mapUserPulse 1.8s ease-out infinite;"></div>
            <div style="position:absolute; inset:7px; border-radius:50%;
              background:#2db7ab; border:2.5px solid #f6f2e9;
              box-shadow:0 3px 8px rgba(10,29,58,0.5);"></div>
          </div>`;
        el.title = "Sen buradasın";
        userMarkerRef.current = new maplibregl.Marker({ element: el })
          .setLngLat([live.lng, live.lat])
          .addTo(map);

        // Stil sayfasında bu animasyon zaten var mı? Garantiye almak için ekle.
        if (!document.getElementById("__istbam_pulse_style")) {
          const s = document.createElement("style");
          s.id = "__istbam_pulse_style";
          s.textContent = `@keyframes mapUserPulse {
            0% { transform: scale(0.9); opacity: 0.7; }
            70% { transform: scale(1.7); opacity: 0; }
            100% { transform: scale(1.7); opacity: 0; }
          }`;
          document.head.appendChild(s);
        }
      } else {
        userMarkerRef.current.setLngLat([live.lng, live.lat]);
      }
    };

    if (map.loaded()) apply();
    else map.on("load", apply);
  }, [live?.lng, live?.lat]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-card overflow-hidden ring-1 ring-line shadow-lg shadow-bogaz-deep/10"
    />
  );
}
