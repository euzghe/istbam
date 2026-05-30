"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  live?: { lng: number; lat: number };
};

// İki nokta arası mesafe (m) — yalnız anlamlı hareketlerde iframe'i tazele.
function metersBetween(a: { lng: number; lat: number }, b: { lng: number; lat: number }) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function TrafficMapOverlay({ open, onClose, live }: Props) {
  const [visible, setVisible] = useState(false);
  // Iframe için "snapshot" konum — sürekli pozisyon güncellemeleri iframe'i
  // yeniden yüklemesin diye sadece >75m oynayınca veya manuel butonla değişir.
  const [snapshot, setSnapshot] = useState<{ lng: number; lat: number } | null>(
    live ?? null,
  );
  const [recenterTick, setRecenterTick] = useState(0);
  const lastSyncRef = useRef<number>(0);

  // Overlay ilk açıldığında canlı konumu snapshot olarak al.
  useEffect(() => {
    if (open && live && !snapshot) setSnapshot(live);
  }, [open, live, snapshot]);

  // Canlı konum 75m'den fazla oynadıysa snapshot'ı güncelle (iframe reload olur).
  useEffect(() => {
    if (!open || !live) return;
    if (!snapshot) {
      setSnapshot(live);
      return;
    }
    const d = metersBetween(snapshot, live);
    const now = Date.now();
    // En az 8 sn aralıkla ve 75m üstü hareketlerde güncelle.
    if (d > 75 && now - lastSyncRef.current > 8000) {
      lastSyncRef.current = now;
      setSnapshot({ lng: live.lng, lat: live.lat });
    }
  }, [live, open, snapshot]);

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

  // Iframe URL — snapshot konuma odakla + üzerine kırmızı pin koy.
  // Yandex pt param: lng,lat,style — pm2rdm = orta boy kırmızı pin.
  const yandexUrl = useMemo(() => {
    const center = snapshot ?? { lng: 29.02, lat: 41.05 };
    const ll = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
    const z = snapshot ? 14 : 10;
    const pt = snapshot
      ? `&pt=${center.lng.toFixed(5)},${center.lat.toFixed(5)},pm2rdm`
      : "";
    // recenterTick URL'ye eklenerek "Konumuma git" butonunda iframe tazelenir.
    const tick = recenterTick ? `&_t=${recenterTick}` : "";
    return `https://yandex.com.tr/map-widget/v1/?lang=tr_TR&ll=${ll}&z=${z}&l=trf${pt}${tick}`;
  }, [snapshot, recenterTick]);

  const yandexFull = useMemo(() => {
    const center = snapshot ?? { lng: 29.02, lat: 41.05 };
    const ll = `${center.lng.toFixed(5)},${center.lat.toFixed(5)}`;
    const z = snapshot ? 14 : 10;
    const pt = snapshot
      ? `&pt=${center.lng.toFixed(5)},${center.lat.toFixed(5)},pm2rdm`
      : "";
    return `https://yandex.com.tr/maps/?ll=${ll}&z=${z}&l=trf${pt}`;
  }, [snapshot]);

  if (!visible && !open) return null;

  const recenter = () => {
    if (!live) return;
    setSnapshot({ lng: live.lng, lat: live.lat });
    setRecenterTick((t) => t + 1);
  };

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
            <div className="text-[10px] uppercase tracking-widest text-vapur font-semibold flex items-center gap-1.5">
              Trafik haritası · Yandex canlı
              {live && snapshot && (
                <span className="inline-flex items-center gap-1 rounded-full bg-vapur/20 text-vapur px-1.5 py-0.5 text-[9px] font-bold normal-case tracking-normal">
                  <span className="inline-block size-1.5 rounded-full bg-vapur animate-pulse" />
                  Konumun haritada
                </span>
              )}
            </div>
            <div className="font-display font-semibold leading-tight">
              İstanbul anlık trafik akışı
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {live && (
              <button
                onClick={recenter}
                className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-vapur-soft transition"
                title="Haritayı konumuma odakla"
              >
                📍 Konumum
              </button>
            )}
            <a
              href={yandexFull}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-sis/15 text-sis font-semibold text-[11px] px-3 py-1.5 hover:bg-sis/20 transition hidden sm:inline-block"
            >
              Tam ekran ↗
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
