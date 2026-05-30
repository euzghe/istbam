"use client";

import { useEffect, useRef, useState } from "react";
import { usePanel } from "../PanelContext";

type Parked = {
  label: string;
  savedAt: number;
  lng?: number;
  lat?: number;
  accuracy?: number;
  // AVM otoparkı için: "Kat B2 · Sıra 14 · Mavi sütun yanı"
  note?: string;
  // 500x500'e küçültülmüş JPEG, base64 data URL (~30-80KB)
  photoDataUrl?: string;
};

const KEY = "istbam:parked";

// Foto'yu canvas'la 500x500 max'e küçült, JPEG q=0.7 — localStorage dostu.
async function shrinkImage(file: File): Promise<string> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("read fail"));
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = () => rej(new Error("img fail"));
    im.src = dataUrl;
  });
  const MAX = 600;
  const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("canvas fail");
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/jpeg", 0.72);
}

export function ParkedCard() {
  const { live } = usePanel();
  const [parked, setParked] = useState<Parked | null>(null);
  const [flash, setFlash] = useState<"saved" | "error" | null>(null);
  const [saving, setSaving] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw) as Parked;
        setParked(p);
        setNoteDraft(p.note ?? "");
      }
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

  function saveNote() {
    if (!parked) return;
    persist({ ...parked, note: noteDraft.trim() || undefined });
  }

  async function onPhotoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !parked) return;
    setPhotoUploading(true);
    try {
      const url = await shrinkImage(f);
      persist({ ...parked, photoDataUrl: url });
    } catch {
      setFlash("error");
      setTimeout(() => setFlash(null), 2500);
    } finally {
      setPhotoUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removePhoto() {
    if (!parked) return;
    const next = { ...parked };
    delete next.photoDataUrl;
    persist(next);
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
    <>
      {photoOpen && parked?.photoDataUrl && (
        <div
          role="dialog"
          aria-modal
          className="fixed inset-0 z-[70] bg-bogaz-deep/95 backdrop-blur flex items-center justify-center p-4"
          onClick={() => setPhotoOpen(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={parked.photoDataUrl}
            alt="Park noktası — tam boy"
            className="max-w-full max-h-full rounded-lg shadow-2xl"
          />
          <button
            onClick={() => setPhotoOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-sis/15 text-sis text-xs font-semibold px-3 py-1.5 ring-1 ring-sis/25"
          >
            ✕ Kapat
          </button>
        </div>
      )}
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

            {/* AVM otoparkı kahramanı: not + foto */}
            <div className="mt-5 pt-4 border-t border-sis/15 space-y-3">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-mehtap font-semibold block mb-1.5">
                  📝 Kat / sıra notu
                </label>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value.slice(0, 200))}
                  onBlur={saveNote}
                  placeholder="Örn: Kat B2 · Sıra 14 · Mavi sütun yanı · A asansörüne yakın"
                  rows={2}
                  className="w-full rounded-lg bg-bogaz-deep/60 ring-1 ring-sis/15 px-3 py-2 text-sm text-sis placeholder:text-sis/35 focus:ring-cini/40 focus:outline-none resize-none"
                />
                {noteDraft !== (parked.note ?? "") && (
                  <button
                    onClick={saveNote}
                    className="mt-1.5 text-[11px] font-semibold text-cini hover:text-cini-soft"
                  >
                    Notu kaydet →
                  </button>
                )}
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-mehtap font-semibold block mb-1.5">
                  📷 Park noktası fotoğrafı
                </label>
                {parked.photoDataUrl ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPhotoOpen(true)}
                      className="block w-full rounded-lg overflow-hidden ring-1 ring-sis/15 hover:ring-cini/40 transition"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={parked.photoDataUrl}
                        alt="Park noktası"
                        className="w-full max-h-44 object-cover"
                      />
                    </button>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-[11px] rounded-full bg-sis/10 text-sis ring-1 ring-sis/20 px-2.5 py-1 hover:bg-sis/15"
                      >
                        🔄 Değiştir
                      </button>
                      <button
                        onClick={removePhoto}
                        className="text-[11px] rounded-full bg-vapur-red/20 text-vapur-red ring-1 ring-vapur-red/30 px-2.5 py-1 hover:bg-vapur-red/30"
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={photoUploading}
                    className="w-full rounded-lg bg-bogaz-deep/60 ring-1 ring-dashed ring-sis/25 px-4 py-5 text-sm text-sis/70 hover:ring-cini/40 hover:text-sis transition disabled:opacity-50"
                  >
                    {photoUploading
                      ? "Hazırlanıyor…"
                      : "📷 Foto ekle (kapı, sütun no, çevre)"}
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={onPhotoPick}
                  className="hidden"
                />
              </div>
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
    </>
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
