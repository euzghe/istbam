"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  BRIDGES,
  bridgeEstimatedDensity,
  bridgeEstimatedMin,
} from "@/data/bridges";

export function TrafficMapCard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [cityIndex, setCityIndex] = useState<number | null>(null);

  useEffect(() => {
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
  }, []);

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
      center: [29.02, 41.05],
      zoom: 10.3,
      attributionControl: { compact: true },
    });
    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Köprü markerlarını cityIndex'e göre renklendir
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const draw = () => {
      // Eski markerları temizle
      const existing = document.querySelectorAll("[data-bridge-marker]");
      existing.forEach((el) => el.remove());

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
        el.setAttribute("data-bridge-marker", "1");
        el.style.cssText = `
          width: 32px; height: 32px; border-radius: 50%;
          background: ${color};
          border: 3px solid #f6f2e9;
          box-shadow: 0 4px 12px rgba(10,29,58,0.4);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 800; font-size: 14px;
          font-family: var(--font-manrope), system-ui;
          transition: box-shadow .15s ease;
        `;
        el.textContent = b.shortName[0];
        el.title = `${b.name} — ${density ?? "?"}/100 yoğunluk`;

        el.addEventListener("mouseenter", () => {
          el.style.boxShadow = `0 0 0 8px ${color}44, 0 4px 12px rgba(10,29,58,0.4)`;
        });
        el.addEventListener("mouseleave", () => {
          el.style.boxShadow = "0 4px 12px rgba(10,29,58,0.4)";
        });

        el.addEventListener("click", () => {
          const safe = (s: string) =>
            s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
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
    };

    if (map.loaded()) draw();
    else map.once("load", draw);
  }, [cityIndex]);

  return (
    <section className="rounded-2xl overflow-hidden ring-1 ring-line shadow-md shadow-bogaz-deep/10 relative">
      <div className="px-4 py-2.5 bg-bogaz-deep text-sis flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-vapur font-bold">
            Boğaz geçiş haritası
          </div>
          <div className="text-sm font-semibold leading-tight">
            Şu anki yoğunluk seviyeleri
          </div>
        </div>
        <a
          href="https://uym.ibb.gov.tr/yharita6/"
          target="_blank"
          rel="noreferrer"
          className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-vapur-soft transition shrink-0"
        >
          İBB resmi harita ↗
        </a>
      </div>

      <div ref={containerRef} className="w-full h-[360px] relative" />

      <div className="px-4 py-2 bg-card/95 flex items-center gap-3 text-[11px] text-on-soft">
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
          Per-köprü yoğunluk tahmini (İBB şehir endeksinden türetildi)
        </span>
      </div>
    </section>
  );
}
