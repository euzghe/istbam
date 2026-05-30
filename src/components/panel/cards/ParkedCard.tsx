"use client";

import { useEffect, useState } from "react";
import { usePanel } from "../PanelContext";

type Parked = {
  label: string;
  savedAt: number;
  lng?: number;
  lat?: number;
  accuracy?: number;
};

const KEY = "istbam:parked";

export function ParkedCard() {
  const { live } = usePanel();
  const [parked, setParked] = useState<Parked | null>(null);
  const [flash, setFlash] = useState<"saved" | "error" | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setParked(JSON.parse(raw));
    } catch {}
  }, []);

  function persist(p: Parked) {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {}
    setParked(p);
    setFlash("saved");
    setTimeout(() => setFlash(null), 2000);
  }

  function saveCurrent() {
    setSaving(true);

    // Öncelik 1: PanelContext'teki canlı konum — anında kullan
    if (live) {
      persist({
        label: "Araba burada",
        savedAt: Date.now(),
        lng: live.lng,
        lat: live.lat,
        accuracy: live.accuracy,
      });
      setSaving(false);
      return;
    }

    // Öncelik 2: tek seferlik getCurrentPosition
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      persist({ label: "Araba burada (konumsuz)", savedAt: Date.now() });
      setSaving(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        persist({
          label: "Araba burada",
          savedAt: Date.now(),
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: pos.coords.accuracy,
        });
        setSaving(false);
      },
      () => {
        // İzin reddedilse bile konumsuz kaydet
        persist({ label: "Araba burada (konumsuz)", savedAt: Date.now() });
        setFlash("error");
        setTimeout(() => setFlash(null), 2500);
        setSaving(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30_000 }
    );
  }

  function clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {}
    setParked(null);
  }

  return (
    <section className="rounded-2xl bg-bogaz-deep text-sis ring-1 ring-cini/20 shadow-md shadow-bogaz-deep/30 overflow-hidden relative">
      {flash && (
        <div
          className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
            flash === "saved"
              ? "bg-cini text-bogaz-deep"
              : "bg-vapur-red text-sis"
          } animate-fade-in`}
        >
          {flash === "saved" ? "✓ Kaydedildi" : "Konum alınamadı"}
        </div>
      )}

      <div className="px-5 pt-4 pb-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-mehtap font-semibold">
          🅿 Arabamı buraya park ettim
        </div>

        {parked ? (
          <>
            <h2 className="mt-1.5 font-display text-lg font-semibold leading-tight">
              {parked.label}
            </h2>
            <p className="text-xs text-sis/65 mt-1">
              {timeAgo(parked.savedAt)}
              {parked.lng && parked.lat ? (
                <>
                  {" · "}
                  <span className="font-mono">
                    {parked.lat.toFixed(5)}, {parked.lng.toFixed(5)}
                  </span>
                  {parked.accuracy
                    ? ` · ±${Math.round(parked.accuracy)} m`
                    : ""}
                </>
              ) : null}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {parked.lng && parked.lat && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${parked.lat},${parked.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3.5 py-1.5 hover:bg-vapur-soft transition"
                >
                  🧭 Yol tarifi al
                </a>
              )}
              <button
                onClick={saveCurrent}
                disabled={saving}
                className="rounded-full bg-cini text-bogaz-deep font-semibold text-xs px-3.5 py-1.5 hover:bg-cini-soft transition disabled:opacity-50"
              >
                {saving ? "Kaydediliyor…" : "Şu anki konumla güncelle"}
              </button>
              <button
                onClick={clear}
                className="rounded-full ring-1 ring-sis/25 text-sis/85 text-xs px-3.5 py-1.5 hover:bg-sis/10 transition"
              >
                Kaydı sil
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="mt-1.5 font-display text-lg font-semibold leading-tight">
              Bir tıkla unutmaktan kurtul.
            </h2>
            <p className="text-xs text-sis/65 mt-1">
              {live
                ? "Şu an buradayım, kaydedeyim."
                : "Park edince dokun — site konumunu sessizce hatırlasın."}
            </p>
            <button
              onClick={saveCurrent}
              disabled={saving}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-4 py-2 hover:bg-vapur-soft transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Spinner /> Kaydediliyor…
                </>
              ) : (
                <>📍 Konumu kaydet</>
              )}
            </button>
            {live && (
              <div className="mt-2 text-[10px] text-sis/55 font-mono">
                Hazır: {live.lat.toFixed(5)}, {live.lng.toFixed(5)} · ±
                {Math.round(live.accuracy)} m
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block size-3 rounded-full border-2 border-bogaz-deep/30 border-t-bogaz-deep animate-spin"
      aria-hidden
    />
  );
}

function timeAgo(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "az önce";
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}
