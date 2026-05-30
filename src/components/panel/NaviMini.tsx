"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  junctionLat: number;
  junctionLng: number;
  junctionName: string;
  userLng?: number;
  userLat?: number;
  distanceM: number;
  routeGeometry?: { type: "LineString"; coordinates: [number, number][] };
  // Sıradaki manevra noktası (varsa, kavşak yerine bunu vurgular)
  maneuverLngLat?: [number, number];
  maneuverArrow?: string;
};

export function NaviMini({
  junctionLat,
  junctionLng,
  junctionName,
  userLng,
  userLat,
  distanceM,
  routeGeometry,
  maneuverLngLat,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const focusMarkerRef = useRef<maplibregl.Marker | null>(null);

  const live = userLng != null && userLat != null;
  const uLng = userLng ?? junctionLng;
  const uLat = userLat ?? junctionLat - 0.0022;

  // Odak noktası: manevra varsa o, yoksa kavşak
  const focusLng = maneuverLngLat?.[0] ?? junctionLng;
  const focusLat = maneuverLngLat?.[1] ?? junctionLat;

  // Harita kurulumu
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
      center: [(focusLng + uLng) / 2, (focusLat + uLat) / 2],
      zoom: 14,
      interactive: true,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      // Rota katmanı (boşta başla, geometry geldiğinde doldur)
      map.addSource("navi-route", {
        type: "geojson",
        data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } },
      });
      // Casing (kalın koyu kenar)
      map.addLayer({
        id: "navi-route-casing",
        type: "line",
        source: "navi-route",
        paint: {
          "line-color": "#0a1d3a",
          "line-width": 9,
          "line-opacity": 0.55,
        },
      });
      // Ana çizgi
      map.addLayer({
        id: "navi-route-line",
        type: "line",
        source: "navi-route",
        paint: {
          "line-color": "#f5a524",
          "line-width": 6,
          "line-opacity": 0.95,
        },
      });

      // Sürücü marker
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position:relative; width:38px; height:38px;">
          <div style="position:absolute; inset:0; border-radius:50%;
            background:#2db7ab; opacity:0.35; animation: naviPulse 1.6s ease-out infinite;"></div>
          <div style="position:absolute; inset:9px; border-radius:50%;
            background:#2db7ab; border:2.5px solid #f6f2e9;
            box-shadow:0 3px 8px rgba(10,29,58,0.5);"></div>
        </div>`;
      userMarkerRef.current = new maplibregl.Marker({ element: userEl })
        .setLngLat([uLng, uLat])
        .addTo(map);

      // Odak (manevra/kavşak) marker
      const focusEl = document.createElement("div");
      focusEl.style.cssText = `
        width: 0; height: 0;
        border-left: 13px solid transparent;
        border-right: 13px solid transparent;
        border-bottom: 20px solid #f5a524;
        filter: drop-shadow(0 3px 6px rgba(10,29,58,0.6));
      `;
      focusEl.title = junctionName;
      focusMarkerRef.current = new maplibregl.Marker({
        element: focusEl,
        anchor: "bottom",
      })
        .setLngLat([focusLng, focusLat])
        .addTo(map);

      if (!document.getElementById("__istbam_navi_pulse")) {
        const s = document.createElement("style");
        s.id = "__istbam_navi_pulse";
        s.textContent = `@keyframes naviPulse { 0% { transform: scale(0.9); opacity: 0.7; } 70% { transform: scale(1.7); opacity: 0; } 100% { transform: scale(1.7); opacity: 0; } }`;
        document.head.appendChild(s);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      userMarkerRef.current = null;
      focusMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rota geometrisi geldiğinde polyline çiz + bounds fit
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      const src = map.getSource("navi-route") as
        | maplibregl.GeoJSONSource
        | undefined;
      if (!src) return;

      if (routeGeometry && routeGeometry.coordinates.length > 1) {
        src.setData({
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        });
        const bbox = new maplibregl.LngLatBounds();
        routeGeometry.coordinates.forEach((c) =>
          bbox.extend(c as [number, number])
        );
        map.fitBounds(bbox, { padding: 60, maxZoom: 16, duration: 600 });
      } else {
        // Rota yok — sadece user → odak iki nokta fit et
        src.setData({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: [
              [uLng, uLat],
              [focusLng, focusLat],
            ],
          },
        });
        const bbox = new maplibregl.LngLatBounds()
          .extend([uLng, uLat])
          .extend([focusLng, focusLat]);
        map.fitBounds(bbox, { padding: 60, maxZoom: 16, duration: 600 });
      }
    };

    if (map.loaded()) apply();
    else map.once("load", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGeometry?.coordinates.length]);

  // Kullanıcı konumu değişince marker'ı güncelle (haritayı oynatma)
  useEffect(() => {
    userMarkerRef.current?.setLngLat([uLng, uLat]);
  }, [uLng, uLat]);

  // Odak (manevra) noktası değişince
  useEffect(() => {
    focusMarkerRef.current?.setLngLat([focusLng, focusLat]);
  }, [focusLng, focusLat]);

  return (
    <div className="px-5 mt-3">
      <div className="relative rounded-xl overflow-hidden ring-1 ring-sis/15 bg-bogaz-deep">
        <div ref={containerRef} className="w-full h-[280px] sm:h-[320px]" />

        <div className="absolute top-2 left-2 inline-flex items-center gap-1.5 bg-bogaz-deep/85 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
          <span
            className={`size-1.5 rounded-full ${
              live ? "bg-cini animate-pulse" : "bg-mehtap"
            }`}
          />
          <span className={live ? "text-cini-soft" : "text-mehtap"}>
            {live ? "Canlı konum" : "Demo konum"}
          </span>
        </div>

        <div className="absolute top-2 right-2 bg-vapur text-bogaz-deep text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
          {distanceM < 1000
            ? `${distanceM} m`
            : `${(distanceM / 1000).toFixed(1)} km`}
        </div>

        <div className="absolute bottom-2 left-2 right-2 bg-bogaz-deep/85 backdrop-blur rounded-md px-2.5 py-1.5 text-[11px] text-sis truncate">
          ↗ {junctionName}
        </div>
      </div>
    </div>
  );
}
