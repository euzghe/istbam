"use client";

import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  live?: { lng: number; lat: number };
};

export function TrafficMapOverlay({ open, onClose, live }: Props) {
  const [visible, setVisible] = useState(false);

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

  if (!visible && !open) return null;

  // Yandex Maps map-widget — l=trf trafik katmanını açar, gerçek per-segment renkli.
  // Yandex'in CSP'sinde X-Frame-Options yok, iframe'lenebiliyor.
  const ll = live
    ? `${live.lng.toFixed(5)},${live.lat.toFixed(5)}`
    : "29.02,41.05";
  const z = live ? 13 : 10;
  const yandexUrl = `https://yandex.com.tr/map-widget/v1/?lang=tr_TR&ll=${ll}&z=${z}&l=trf`;

  // Tam ekran Yandex linki (yeni sekme için)
  const yandexFull = `https://yandex.com.tr/maps/?ll=${ll}&z=${z}&l=trf`;

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
              Trafik haritası · Yandex canlı
            </div>
            <div className="font-display font-semibold leading-tight">
              İstanbul anlık trafik akışı
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={yandexFull}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-vapur-soft transition hidden sm:inline-block"
            >
              Yandex tam ekran ↗
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

        {/* Yandex iframe — gerçek per-segment trafik */}
        <iframe
          src={yandexUrl}
          className="flex-1 border-0 bg-bogaz-deep"
          title="Yandex Trafik Haritası"
          loading="lazy"
        />

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
            Veri kaynağı: Yandex Maps canlı trafik
          </span>
        </footer>
      </div>
    </div>
  );
}
