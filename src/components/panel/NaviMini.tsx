"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  // Kavşak verisi opsiyonel — yoksa kullanıcının konumuna odaklanırız.
  junctionLat?: number;
  junctionLng?: number;
  junctionName?: string;
  userLng?: number;
  userLat?: number;
  distanceM?: number;
  routeGeometry?: { type: "LineString"; coordinates: [number, number][] };
  maneuverLngLat?: [number, number];
  maneuverArrow?: string;
};

// İstanbul merkez fallback (Galata - kullanıcı konumu yoksa)
const ISTANBUL_CENTER = { lng: 28.974, lat: 41.0255 };

// Şehir bearing — iki nokta arası yön açısı (kuzeyden saat yönünde derece)
function bearing(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number }
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const dLng = toRad(to.lng - from.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

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
  const [followMode, setFollowMode] = useState(true);
  const [cityIndex, setCityIndex] = useState<number | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  // Tam ekran açılıp kapanınca canvas boyutu değişir — map.resize() çağırmak gerek.
  useEffect(() => {
    if (!mapRef.current) return;
    // CSS geçişinin (border-radius vs.) bitmesini bekle.
    const t = setTimeout(() => mapRef.current?.resize(), 60);
    return () => clearTimeout(t);
  }, [fullscreen]);

  // Tam ekrandayken ESC kapatsın, body scroll kilitlensin.
  useEffect(() => {
    if (!fullscreen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  const live = userLng != null && userLat != null;
  const hasJunction = junctionLat != null && junctionLng != null;

  // Konum > kavşak > İstanbul merkezi sıralı fallback
  const uLng = userLng ?? junctionLng ?? ISTANBUL_CENTER.lng;
  const uLat = userLat ?? (junctionLat != null ? junctionLat - 0.0022 : ISTANBUL_CENTER.lat);

  const focusLng = maneuverLngLat?.[0] ?? junctionLng ?? uLng;
  const focusLat = maneuverLngLat?.[1] ?? junctionLat ?? uLat;

  // İBB şehir trafik endeksini çek (rota polyline rengi için)
  useEffect(() => {
    let alive = true;
    fetch("/api/traffic")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d.source === "ibb") setCityIndex(d.current.index);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  // Trafiğe göre rota rengi
  const trafficColor =
    cityIndex == null
      ? "#f5a524"
      : cityIndex < 30
      ? "#2eb872"
      : cityIndex < 60
      ? "#f5a524"
      : "#c84b4b";

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
      maxPitch: 75,
      interactive: true,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on("load", () => {
      map.addSource("navi-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });
      map.addLayer({
        id: "navi-route-casing",
        type: "line",
        source: "navi-route",
        paint: {
          "line-color": "#0a1d3a",
          "line-width": 10,
          "line-opacity": 0.5,
        },
      });
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

      // Kavşak hedef üçgeni — yalnız hedef varsa göster.
      if (hasJunction) {
        const focusEl = document.createElement("div");
        focusEl.style.cssText = `
          width: 0; height: 0;
          border-left: 13px solid transparent;
          border-right: 13px solid transparent;
          border-bottom: 20px solid #f5a524;
          filter: drop-shadow(0 3px 6px rgba(10,29,58,0.6));
        `;
        focusEl.title = junctionName ?? "Hedef";
        focusMarkerRef.current = new maplibregl.Marker({
          element: focusEl,
          anchor: "bottom",
        })
          .setLngLat([focusLng, focusLat])
          .addTo(map);
      }

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

  // Trafik rengi değişince çizgiyi yenile
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      if (map.getLayer("navi-route-line")) {
        map.setPaintProperty("navi-route-line", "line-color", trafficColor);
      }
    };
    if (map.loaded()) apply();
    else map.once("load", apply);
  }, [trafficColor]);

  // Rota geometrisi geldiğinde polyline + zoom davranışı
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

        if (followMode && live && routeGeometry.coordinates.length > 2) {
          // Yakın takip: kullanıcı arabasının arkasından bakış — eğimli + yakın
          const head = bearing(
            { lng: uLng, lat: uLat },
            { lng: focusLng, lat: focusLat }
          );
          map.easeTo({
            center: [uLng, uLat],
            zoom: 17.5,
            bearing: head,
            pitch: 65,
            duration: 700,
          });
        } else {
          // Genel bakış: tüm rotayı sığdır
          const bbox = new maplibregl.LngLatBounds();
          routeGeometry.coordinates.forEach((c) =>
            bbox.extend(c as [number, number])
          );
          map.fitBounds(bbox, {
            padding: 60,
            maxZoom: 16,
            duration: 600,
            bearing: 0,
            pitch: 0,
          });
        }
      } else if (hasJunction) {
        // Rota yok ama kavşak var — kullanıcı ile kavşak arası düz çizgi.
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
      } else {
        // Ne kavşak ne rota — sadece kullanıcıya odaklan.
        src.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        });
        map.easeTo({
          center: [uLng, uLat],
          zoom: live ? 15 : 11,
          pitch: 0,
          bearing: 0,
          duration: 600,
        });
      }
    };

    if (map.loaded()) apply();
    else map.once("load", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeGeometry?.coordinates.length, followMode]);

  // Konum tick'lerinde marker güncelle, follow modda haritayı kaydır
  useEffect(() => {
    userMarkerRef.current?.setLngLat([uLng, uLat]);
    const map = mapRef.current;
    // Konum varsa ve takip aktifse haritayı kullanıcıya odakla.
    // Eski sürüm route geometrisi de istiyordu — bu nedenle hedef yokken
    // veya rota gelmeden konum ilerlemiyordu. Artık şart değil.
    if (map && followMode && live) {
      const hasNav = hasJunction && routeGeometry != null;
      if (hasNav) {
        // Navigasyon modu: arabanın arkasından eğimli yakın takip
        const head = bearing(
          { lng: uLng, lat: uLat },
          { lng: focusLng, lat: focusLat },
        );
        map.easeTo({
          center: [uLng, uLat],
          bearing: head,
          pitch: 65,
          zoom: 17.5,
          duration: 500,
        });
      } else {
        // Idle/boş: kuzey-yukarı düz harita, kullanıcıyı merkezde tut
        map.easeTo({
          center: [uLng, uLat],
          zoom: 16,
          pitch: 0,
          bearing: 0,
          duration: 500,
        });
      }
    }
  }, [uLng, uLat, followMode, focusLng, focusLat, live, routeGeometry, hasJunction]);

  useEffect(() => {
    focusMarkerRef.current?.setLngLat([focusLng, focusLat]);
  }, [focusLng, focusLat]);

  function toggleMode() {
    const next = !followMode;
    setFollowMode(next);
    // Yakın takibe geçtiğin anda haritayı hemen kullanıcıya odakla —
    // bir sonraki GPS tick'ini bekleme.
    const map = mapRef.current;
    if (next && map && live) {
      const hasNav = hasJunction && routeGeometry != null;
      map.easeTo({
        center: [uLng, uLat],
        zoom: hasNav ? 17.5 : 16,
        pitch: hasNav ? 65 : 0,
        bearing: hasNav
          ? bearing({ lng: uLng, lat: uLat }, { lng: focusLng, lat: focusLat })
          : 0,
        duration: 450,
      });
    }
  }

  // Tam ekran modunda overlay sarmalı, inline modda kart kabuğu.
  const wrapperClass = fullscreen
    ? "fixed inset-0 z-[60] bg-bogaz-deep"
    : "px-5 mt-3";
  const frameClass = fullscreen
    ? "relative w-full h-full bg-bogaz-deep"
    : "relative rounded-xl overflow-hidden ring-1 ring-sis/15 bg-bogaz-deep";
  const canvasClass = fullscreen
    ? "w-full h-full"
    : "w-full h-[340px] sm:h-[400px]";

  return (
    <div className={wrapperClass}>
      <div className={frameClass}>
        <div ref={containerRef} className={canvasClass} />

        {/* Tam ekran modunda en üstte sabit, görmezden gelemeyeceğin Kapat butonu.
            Safe-area inset ile notch'lu cihazlarda da rahat. */}
        {fullscreen && (
          <button
            onClick={() => setFullscreen(false)}
            className="absolute z-20 left-3 right-3 mx-auto top-0 flex items-center justify-center gap-2 rounded-b-2xl bg-vapur text-bogaz-deep font-bold text-sm py-3 shadow-lg active:bg-vapur-soft transition"
            style={{
              maxWidth: 280,
              paddingTop: "calc(env(safe-area-inset-top) + 12px)",
            }}
            aria-label="Tam ekrandan çık"
          >
            <span className="text-lg leading-none">✕</span>
            <span>TAM EKRANDAN ÇIK</span>
          </button>
        )}

        <div
          className={`absolute left-2 flex items-center gap-1.5 ${
            fullscreen ? "top-20" : "top-2"
          }`}
          style={fullscreen ? { paddingTop: "env(safe-area-inset-top)" } : undefined}
        >
          <span className="inline-flex items-center gap-1.5 bg-bogaz-deep/85 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider">
            <span
              className={`size-1.5 rounded-full ${
                live ? "bg-cini animate-pulse" : "bg-mehtap"
              }`}
            />
            <span className={live ? "text-cini-soft" : "text-mehtap"}>
              {live ? "Canlı" : "Demo"}
            </span>
          </span>
          {cityIndex != null && (
            <span
              className="inline-flex items-center gap-1.5 backdrop-blur rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ background: `${trafficColor}33`, color: trafficColor }}
              title="Rota şehir trafik endeksine göre renkleniyor (İBB canlı)"
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: trafficColor }}
              />
              Trafik {cityIndex}
            </span>
          )}
        </div>

        <div
          className={`absolute right-2 flex items-center gap-1.5 ${
            fullscreen ? "top-20" : "top-2"
          }`}
        >
          <button
            onClick={toggleMode}
            className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 backdrop-blur transition ${
              followMode
                ? "bg-vapur text-bogaz-deep"
                : "bg-bogaz-deep/85 text-sis hover:bg-bogaz-deep"
            }`}
            title={
              followMode
                ? "Genel bakışa geç"
                : "Yakın takip moduna geç"
            }
          >
            {followMode ? "🎯 Yakın takip" : "🗺 Genel bakış"}
          </button>
          {!fullscreen && (
            <button
              onClick={() => setFullscreen(true)}
              className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1 backdrop-blur transition bg-bogaz-deep/85 text-sis hover:bg-bogaz-deep ring-1 ring-sis/15"
              title="Tam ekrana geç"
              aria-label="Tam ekrana geç"
            >
              ⛶ Tam ekran
            </button>
          )}
          {distanceM != null && hasJunction && (
            <span className="bg-vapur text-bogaz-deep text-[10px] font-bold uppercase tracking-wider rounded-full px-2.5 py-1">
              {distanceM < 1000
                ? `${distanceM} m`
                : `${(distanceM / 1000).toFixed(1)} km`}
            </span>
          )}
        </div>

        <div
          className="absolute bottom-2 left-2 right-2 bg-bogaz-deep/85 backdrop-blur rounded-md px-2.5 py-1.5 text-[11px] text-sis truncate"
          style={fullscreen ? { paddingBottom: "env(safe-area-inset-bottom)" } : undefined}
        >
          {hasJunction
            ? `↗ ${junctionName ?? "Hedef"}`
            : live
            ? "📍 Konumun · yaklaşan kavşak yok"
            : "📍 Konumun bekleniyor… (Konum izni ver)"}
        </div>
      </div>
    </div>
  );
}
