"use client";

import { useEffect, useState } from "react";

type SavedInsurance = {
  label: string;
  phone: string;
};

const LS_KEY = "istbam:insurance";

const QUICK = [
  {
    code: "154",
    name: "Trafik Polisi",
    sub: "Kaza, kapalı yol ihbar",
    color: "vapur",
  },
  {
    code: "155",
    name: "Polis İmdat",
    sub: "Hırsızlık, saldırı",
    color: "cini",
  },
  {
    code: "156",
    name: "Jandarma",
    sub: "Şehir dışı, otoyol",
    color: "cini",
  },
  {
    code: "158",
    name: "Sahil Güvenlik",
    sub: "Sahil/deniz kazası",
    color: "cini",
  },
];

export function HelpCard({
  live,
}: {
  live?: { lng: number; lat: number };
}) {
  const [ins, setIns] = useState<SavedInsurance | null>(null);
  const [editing, setEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const v = JSON.parse(raw) as SavedInsurance;
        setIns(v);
      }
    } catch {}
  }, []);

  function saveInsurance() {
    const label = draftLabel.trim() || "Kasko / Sigorta";
    const phone = draftPhone.replace(/\s+/g, "").trim();
    if (!phone) return;
    const v: SavedInsurance = { label, phone };
    localStorage.setItem(LS_KEY, JSON.stringify(v));
    setIns(v);
    setEditing(false);
    setDraftLabel("");
    setDraftPhone("");
  }

  function removeInsurance() {
    localStorage.removeItem(LS_KEY);
    setIns(null);
  }

  // Konum paylaşma URL/metin
  const locationText = live
    ? `Buradayım: https://maps.google.com/?q=${live.lat},${live.lng}`
    : "Buradayım (konum kapalı): https://maps.google.com/";
  const wa = `https://wa.me/?text=${encodeURIComponent(locationText)}`;
  const sms = `sms:?body=${encodeURIComponent(locationText)}`;

  async function copyLocation() {
    try {
      await navigator.clipboard.writeText(locationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-vapur-red font-semibold">
            🆘 Yardım & Çekici
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Acil numara · konum paylaş
          </h2>
        </div>
      </header>

      {/* 112 büyük acil — en üstte */}
      <div className="pb-3">
        <a
          href="tel:112"
          className="group flex items-center justify-between gap-3 rounded-xl bg-vapur-red text-sis px-4 py-3 hover:bg-vapur-red/90 transition shadow-md shadow-vapur-red/30"
        >
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">
              Tüm acil çağrı
            </div>
            <div className="font-display text-3xl font-semibold leading-none">
              112
            </div>
            <div className="text-xs opacity-90 mt-1">
              Sağlık, itfaiye, polis — tek numara
            </div>
          </div>
          <div className="size-12 rounded-full bg-sis/15 ring-1 ring-sis/25 flex items-center justify-center text-xl group-hover:bg-sis/25 transition">
            📞
          </div>
        </a>
      </div>

      {/* Kasko / Kullanıcı sigorta numarası */}
      <div className="pb-3">
        {ins && !editing ? (
          <a
            href={`tel:${ins.phone}`}
            className="flex items-center justify-between gap-3 rounded-xl bg-bogaz text-sis ring-1 ring-cini/30 px-4 py-3 hover:bg-bogaz-soft transition shadow-md shadow-bogaz-deep/20"
          >
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold text-vapur">
                Kayıtlı yardım hattım
              </div>
              <div className="font-display text-xl font-semibold leading-tight truncate">
                {ins.label}
              </div>
              <div className="text-xs text-sis/70 font-mono">{ins.phone}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditing(true);
                  setDraftLabel(ins.label);
                  setDraftPhone(ins.phone);
                }}
                className="rounded-full bg-sis/10 hover:bg-sis/20 ring-1 ring-sis/20 px-2.5 py-1 text-[11px] font-semibold transition"
                title="Düzenle"
              >
                ✎
              </button>
              <span className="size-10 rounded-full bg-vapur text-bogaz-deep flex items-center justify-center text-base">
                📞
              </span>
            </div>
          </a>
        ) : (
          <div className="rounded-xl ring-1 ring-line bg-chip px-3 py-3">
            <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
              Sigortan / yol yardımın
            </div>
            <div className="text-sm font-semibold text-on mt-0.5">
              {editing
                ? "Numarayı güncelle"
                : "Bir kez kaydet, hep elinin altında olsun"}
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-1.5">
              <input
                type="text"
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="Ad (örn. Allianz Kasko)"
                className="rounded-lg bg-card ring-1 ring-line px-3 py-2 text-sm outline-none focus:ring-cini transition"
              />
              <input
                type="tel"
                value={draftPhone}
                onChange={(e) => setDraftPhone(e.target.value)}
                placeholder="0850 222 ..."
                className="rounded-lg bg-card ring-1 ring-line px-3 py-2 text-sm outline-none focus:ring-cini transition font-mono"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={saveInsurance}
                  disabled={!draftPhone.trim()}
                  className="rounded-lg bg-vapur text-bogaz-deep font-semibold text-sm px-3 py-2 hover:bg-vapur-soft transition disabled:opacity-40"
                >
                  Kaydet
                </button>
                {editing && (
                  <button
                    onClick={() => {
                      setEditing(false);
                      removeInsurance();
                    }}
                    className="rounded-lg ring-1 ring-vapur-red/40 text-vapur-red text-sm px-2.5 py-2 hover:bg-vapur-red/10 transition"
                    title="Sil"
                  >
                    Sil
                  </button>
                )}
                {editing && (
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg ring-1 ring-line text-on-soft text-sm px-2.5 py-2 hover:bg-card transition"
                  >
                    İptal
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hızlı numaralar grid */}
      <div className="pb-3">
        <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold mb-1.5">
          Hızlı numara
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {QUICK.map((q) => (
            <a
              key={q.code}
              href={`tel:${q.code}`}
              className="group rounded-lg bg-chip ring-1 ring-line px-3 py-2.5 hover:bg-cini/10 hover:ring-cini/40 transition"
            >
              <div className="font-display text-2xl font-semibold text-on leading-none tabular-nums">
                {q.code}
              </div>
              <div className="text-[11px] font-semibold text-on mt-1 leading-tight">
                {q.name}
              </div>
              <div className="text-[10px] text-on-mute leading-tight">
                {q.sub}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Konum paylaş */}
      <div className="pb-4">
        <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold mb-1.5">
          Konumu paylaş
        </div>
        <div className="rounded-lg ring-1 ring-line bg-chip px-3 py-2.5">
          <div className="text-[11px] text-on-soft mb-2 truncate">
            {live ? (
              <>
                Şu an: <span className="font-mono text-on">
                  {live.lat.toFixed(5)}, {live.lng.toFixed(5)}
                </span>
              </>
            ) : (
              <span className="text-on-mute">
                Konum kapalı — sadece resmi adres paylaşılır
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={copyLocation}
              className="rounded-full bg-card ring-1 ring-line px-3 py-1.5 text-xs font-semibold hover:bg-cini/10 hover:text-cini hover:ring-cini/40 transition"
            >
              {copied ? "✓ Kopyalandı" : "📋 Kopyala"}
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-[#25d366] text-white px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition"
            >
              WhatsApp
            </a>
            <a
              href={sms}
              className="rounded-full bg-bogaz text-sis px-3 py-1.5 text-xs font-semibold hover:bg-bogaz-soft transition"
            >
              SMS
            </a>
          </div>
        </div>
      </div>

      {/* Rehber */}
      <footer className="rounded-2xl bg-bogaz-deep text-sis/85 px-4 py-3 text-[11px] leading-relaxed">
        <div className="text-[9px] uppercase tracking-widest text-vapur font-bold mb-1">
          Ne zaman kimi ararsın?
        </div>
        <ul className="space-y-0.5 text-sis/75">
          <li>
            <strong className="text-vapur">Kaza · yaralı:</strong> 112, sonra
            154
          </li>
          <li>
            <strong className="text-vapur">Lastik · arıza · yolda kaldın:</strong>{" "}
            önce sigorta/kasko (yukarı kaydet)
          </li>
          <li>
            <strong className="text-vapur">Yol kapalı · trafiği bildir:</strong>{" "}
            154
          </li>
          <li>
            <strong className="text-vapur">Otoyolda kaza:</strong> 156
            (jandarma) veya 154
          </li>
        </ul>
      </footer>
    </section>
  );
}
