"use client";

import { useEffect, useRef, useState } from "react";
import { MapView } from "./MapView";
import type { IsparkLive } from "@/lib/ispark-source";

type Props = {
  open: boolean;
  onClose: () => void;
  isparks: IsparkLive[];
  focus?: { lng: number; lat: number; zoom?: number };
  selectedIsparkId?: number;
  setSelectedIsparkId?: (id: number) => void;
  title?: string;
  live?: { lng: number; lat: number };
};

export function MapOverlay({
  open,
  onClose,
  isparks,
  focus,
  selectedIsparkId,
  setSelectedIsparkId,
  title,
  live,
}: Props) {
  const [visible, setVisible] = useState(false);
  // Sadece kullanıcı tetiklediği odak değişiklikleri override eder.
  // Geolocation tick'leri marker pozisyonunu günceller ama haritayı oynatmaz.
  const [override, setOverride] = useState<
    { lng: number; lat: number; zoom?: number } | undefined
  >();
  const initialFocusedRef = useRef(false);

  // Açılış: sadece bir kez initial focus seç (live varsa orası, yoksa focus prop'u)
  useEffect(() => {
    if (open) {
      setVisible(true);
      if (!initialFocusedRef.current) {
        initialFocusedRef.current = true;
        if (live) setOverride({ lng: live.lng, lat: live.lat, zoom: 15 });
        else setOverride(undefined);
      }
    } else {
      // Kapanırken bayrak resetle ki bir sonraki açılışta initial focus tekrar olsun
      initialFocusedRef.current = false;
      setOverride(undefined);
      const t = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(t);
    }
    // live değişiminde tetiklenmez — kasıtlı (haritayı oynatma)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const activeFocus = override ?? focus;

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? "Harita"}
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
              Harita · {isparks.length} İSPARK
            </div>
            <div className="font-display font-semibold leading-tight truncate">
              {title ?? "İSPARK ve Kavşaklar"}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {live && (
              <button
                onClick={() => setOverride({ ...live, zoom: 15.5 })}
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold bg-cini text-bogaz-deep hover:bg-cini-soft transition"
                title="Kendi konumuna git"
              >
                <span>📍</span>
                <span className="hidden sm:inline">Konumum</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-full px-3 py-1.5 text-xs font-semibold bg-sis/10 hover:bg-sis/15 ring-1 ring-sis/20 transition"
              aria-label="Haritayı kapat"
            >
              ✕ Kapat
            </button>
          </div>
        </header>

        <div className="relative flex-1">
          <MapView
            isparks={isparks}
            focus={activeFocus}
            selectedIsparkId={selectedIsparkId}
            onSelectIspark={setSelectedIsparkId}
            live={live}
          />
          {!live && (
            <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-bogaz-deep/85 backdrop-blur rounded-card px-3 py-2 text-xs text-sis ring-1 ring-cini/30 max-w-sm">
              <strong className="text-vapur">Konum kapalı.</strong> Tarayıcıya
              izin verirsen harita seninle açılır ve konumun nokta olarak görünür.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
