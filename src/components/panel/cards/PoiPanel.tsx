"use client";

import { useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  poiLegend,
  poiMarkerColor,
  type Poi,
  type PoiType,
} from "@/lib/poi-source";
import { haversineKm } from "@/lib/geo";
import { usePanel } from "../PanelContext";

type Props = {
  type: PoiType;
  title: string;
  emptyHint?: string;
  officialLinks?: { label: string; url: string }[];
  footerNote?: string;
};

export function PoiPanel({
  type,
  title,
  emptyHint,
  officialLinks,
  footerNote,
}: Props) {
  const { live, destination } = usePanel();
  const [items, setItems] = useState<Poi[]>([]);
  const [loading, setLoading] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scope, setScope] = useState<"nearby" | "istanbul">("nearby");

  const ref = live ?? destination;

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const url =
      scope === "istanbul"
        ? `/api/poi/${type}?scope=istanbul`
        : ref
        ? `/api/poi/${type}?lat=${ref.lat}&lng=${ref.lng}&r=4000`
        : null;

    if (!url) {
      setLoading(false);
      return;
    }

    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setItems((d.items ?? []) as Poi[]);
        setLoading(false);
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, ref?.lng, ref?.lat, type]);

  const withDist = ref
    ? items
        .map((p) => ({ ...p, distanceKm: haversineKm(ref, p) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
    : items.map((p) => ({ ...p, distanceKm: 0 }));

  const visible = withDist.slice(0, 8);
  const legend = poiLegend(type);

  return (
    <>
      {/* Kapsam toggle */}
      <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm p-1 flex">
        <button
          onClick={() => setScope("nearby")}
          className={`flex-1 rounded-xl text-xs font-semibold py-2 transition ${
            scope === "nearby"
              ? "bg-bogaz text-sis shadow-sm"
              : "text-on-soft hover:bg-chip"
          }`}
        >
          📍 Yakındakiler
          <span className="block text-[10px] font-normal opacity-70 mt-0.5">
            ~4 km içinde
          </span>
        </button>
        <button
          onClick={() => setScope("istanbul")}
          className={`flex-1 rounded-xl text-xs font-semibold py-2 transition ${
            scope === "istanbul"
              ? "bg-bogaz text-sis shadow-sm"
              : "text-on-soft hover:bg-chip"
          }`}
        >
          🌐 Tüm İstanbul
          <span className="block text-[10px] font-normal opacity-70 mt-0.5">
            şehir geneli
          </span>
        </button>
      </section>

      {/* Renk lejandı + harita butonu */}
      <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          {legend.map((l) => (
            <span key={l.key} className="inline-flex items-center gap-1.5">
              <span
                className="size-2.5 rounded-full"
                style={{ background: l.color }}
              />
              <span className="text-on-soft">{l.label}</span>
            </span>
          ))}
        </div>
        <button
          onClick={() => setMapOpen(true)}
          disabled={withDist.length === 0}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition disabled:opacity-40"
        >
          <span>🗺</span>
          Haritada{" "}
          {scope === "istanbul"
            ? `tüm İstanbul (${withDist.length})`
            : `tümünü gör (${withDist.length})`}
        </button>
      </section>

      {/* Liste */}
      <section className="relative">
        {!ref ? (
          <p className="text-sm text-on-mute px-1 py-4">
            {emptyHint ??
              "Konum açıldığında en yakın yerleri listeleyeceğim."}
          </p>
        ) : loading && visible.length === 0 ? (
          <p className="text-sm text-on-mute px-1 py-4">
            OSM Overpass'tan çekiliyor…{" "}
            {scope === "istanbul" ? "(şehir geneli, 10-20 sn sürebilir)" : ""}
          </p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-on-mute px-1 py-4">
            Kayıt bulunamadı.
          </p>
        ) : (
          <>
            {scope === "istanbul" && (
              <div className="mb-2 text-[11px] text-on-mute">
                Liste en yakın 8. Haritada şehirdeki tüm{" "}
                <strong className="text-on">{withDist.length}</strong> noktayı görürsün.
              </div>
            )}
          <ul className="space-y-2">
            {visible.map((p) => {
              const color = poiMarkerColor(type, p.categoryKey);
              const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
              const isSelected = selectedId === p.id;
              return (
                <li
                  key={p.id}
                  className={`rounded-xl ring-1 px-3 py-2.5 transition ${
                    isSelected
                      ? "bg-card ring-vapur/50 shadow-md shadow-vapur/15"
                      : "bg-card/70 ring-line hover:bg-card hover:ring-bogaz-deep/15"
                  }`}
                >
                  <button
                    className="w-full text-left cursor-pointer flex items-center gap-3"
                    onClick={() => {
                      setSelectedId(p.id);
                      setMapOpen(true);
                    }}
                  >
                    <span
                      className="size-9 rounded-lg flex items-center justify-center text-sis font-bold text-sm shrink-0"
                      style={{ background: color }}
                    >
                      {emoji(type)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-on truncate">
                        {p.name}
                      </div>
                      <div className="text-[11px] text-on-soft truncate">
                        {p.category} ·{" "}
                        {p.distanceKm < 1
                          ? `${Math.round(p.distanceKm * 1000)} m`
                          : `${p.distanceKm.toFixed(1)} km`}
                        {p.phone ? ` · ${p.phone}` : ""}
                      </div>
                    </div>
                    <a
                      href={gmaps}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-2.5 py-1 hover:bg-vapur-soft transition shrink-0"
                    >
                      🧭 Yol
                    </a>
                  </button>
                </li>
              );
            })}
          </ul>
          </>
        )}
      </section>

      {/* Resmi linkler */}
      {officialLinks && officialLinks.length > 0 && (
        <section className="rounded-2xl bg-bogaz-deep text-sis ring-1 ring-cini/30 shadow-md shadow-bogaz-deep/20 px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-vapur font-bold mb-2">
            Resmi kaynaklar
          </div>
          <div className="flex flex-wrap gap-2">
            {officialLinks.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
          {footerNote && (
            <p className="mt-3 text-[11px] text-sis/65 leading-relaxed">
              {footerNote}
            </p>
          )}
        </section>
      )}

      {/* Harita modal */}
      {mapOpen && (
        <PoiMapModal
          type={type}
          title={title}
          items={withDist}
          live={live ? { lng: live.lng, lat: live.lat } : null}
          selectedId={selectedId}
          onClose={() => setMapOpen(false)}
        />
      )}
    </>
  );
}

function emoji(t: PoiType): string {
  if (t === "hastane") return "🏥";
  if (t === "eczane") return "💊";
  if (t === "sarj") return "⚡";
  return "🏬";
}

function PoiMapModal({
  type,
  title,
  items,
  live,
  selectedId,
  onClose,
}: {
  type: PoiType;
  title: string;
  items: (Poi & { distanceKm: number })[];
  live: { lng: number; lat: number } | null;
  selectedId: string | null;
  onClose: () => void;
}) {
  const containerRef = useState<HTMLDivElement | null>(null);
  const [mapEl, setMapEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapEl) return;
    const isDark = document.documentElement.classList.contains("dark");
    const map = new maplibregl.Map({
      container: mapEl,
      style: isDark
        ? "https://tiles.openfreemap.org/styles/dark"
        : "https://tiles.openfreemap.org/styles/positron",
      center: live ? [live.lng, live.lat] : [29.0, 41.025],
      zoom: 12,
      attributionControl: { compact: true },
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      "top-right"
    );

    // Kullanıcı pulse marker
    if (live) {
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position:relative; width:30px; height:30px;">
          <div style="position:absolute; inset:0; border-radius:50%;
            background:#2db7ab; opacity:0.35; animation: mapUserPulse 1.8s ease-out infinite;"></div>
          <div style="position:absolute; inset:7px; border-radius:50%;
            background:#2db7ab; border:2.5px solid #f6f2e9;
            box-shadow:0 3px 8px rgba(10,29,58,0.5);"></div>
        </div>`;
      new maplibregl.Marker({ element: userEl }).setLngLat([live.lng, live.lat]).addTo(map);
    }

    // POI markerları
    const bounds = new maplibregl.LngLatBounds();
    if (live) bounds.extend([live.lng, live.lat]);

    items.forEach((p) => {
      const color = poiMarkerColor(type, p.categoryKey);
      const el = document.createElement("div");
      el.style.cssText = `
        width: 22px; height: 22px; border-radius: 50%;
        background: ${color};
        border: 2.5px solid #f6f2e9;
        box-shadow: 0 3px 6px rgba(10,29,58,0.4);
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 800; font-size: 11px;
        transition: box-shadow .15s ease;
      `;
      el.textContent = emoji(type);
      el.title = `${p.name} — ${p.category}`;
      el.addEventListener("mouseenter", () => {
        el.style.boxShadow = `0 0 0 8px ${color}33, 0 3px 8px rgba(10,29,58,0.45)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.boxShadow = "0 3px 6px rgba(10,29,58,0.4)";
      });

      el.addEventListener("click", () => {
        const safe = (s: string) =>
          s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const gmaps = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
        const phone = p.phone
          ? `<a href="tel:${p.phone}" style="font-size:12px; color:${color}; font-weight:700; text-decoration:none;">📞 ${safe(p.phone)}</a>`
          : "";
        const html = `
          <div style="font-family: var(--font-manrope), system-ui; min-width: 220px;">
            <div style="font-size:9px; font-weight:800; letter-spacing:.08em; color:${color}; text-transform:uppercase;">
              ${safe(p.category)}
            </div>
            <div style="font-size:14px; font-weight:700; color:#0a1d3a; line-height:1.25; margin-top:4px;">
              ${safe(p.name)}
            </div>
            ${phone ? `<div style="margin-top:6px;">${phone}</div>` : ""}
            <div style="display:flex; gap:6px; margin-top:10px;">
              <a href="${gmaps}" target="_blank" rel="noreferrer"
                 style="flex:1; text-align:center; background:#f5a524; color:#0a1d3a; font-weight:700; font-size:12px; padding:8px 10px; border-radius:999px; text-decoration:none;">
                🧭 Yol tarifi
              </a>
            </div>
          </div>
        `;
        new maplibregl.Popup({
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

      if (selectedId === p.id) {
        el.style.outline = "3px solid #0a1d3a";
        el.style.outlineOffset = "2px";
      }

      new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(map);
      bounds.extend([p.lng, p.lat]);
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, duration: 0 });
    }

    return () => map.remove();
  }, [mapEl, items, live, selectedId, type]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="absolute inset-0 bg-bogaz-deep/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute inset-3 sm:inset-6 rounded-card overflow-hidden ring-1 ring-line shadow-2xl shadow-bogaz-deep/40 bg-card flex flex-col">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 bg-bogaz-deep text-sis shrink-0">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-vapur font-semibold">
              Harita · {items.length} nokta
            </div>
            <div className="font-display font-semibold leading-tight truncate">
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1.5 text-xs font-semibold bg-sis/10 hover:bg-sis/15 ring-1 ring-sis/20 transition"
          >
            ✕ Kapat
          </button>
        </header>
        <div ref={setMapEl} className="flex-1" />
      </div>
    </div>
  );
}
