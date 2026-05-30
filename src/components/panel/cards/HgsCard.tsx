"use client";

import { useEffect, useState } from "react";
import {
  HGS_OFFICIAL_HOME,
  HGS_QUERY_URL,
  HGS_TARIFF,
  type HgsToll,
} from "@/data/hgs";

const LS_KEY = "istbam:hgs:checked";

type CheckedMap = Record<string, number>; // tollId → kaç kez geçtin

export function HgsCard() {
  const [checked, setChecked] = useState<CheckedMap>({});
  const [open, setOpen] = useState<"kopru" | "otoyol" | "tunel">("kopru");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, []);

  function inc(id: string, delta: number) {
    setChecked((c) => {
      const next = { ...c, [id]: Math.max(0, (c[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function clearAll() {
    localStorage.removeItem(LS_KEY);
    setChecked({});
  }

  const total = Object.entries(checked).reduce((s, [id, count]) => {
    const t = HGS_TARIFF.tolls.find((x) => x.id === id);
    return t ? s + t.class1Tl * count : s;
  }, 0);

  const passCount = Object.values(checked).reduce((s, n) => s + n, 0);

  const groups: { id: "kopru" | "otoyol" | "tunel"; lbl: string; emoji: string }[] = [
    { id: "kopru", lbl: "Köprüler", emoji: "🌉" },
    { id: "otoyol", lbl: "Otoyollar", emoji: "🛣" },
    { id: "tunel", lbl: "Tüneller", emoji: "🚇" },
  ];

  const tolls = HGS_TARIFF.tolls.filter((t) => t.group === open);

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-semibold">
            🪪 HGS · Bakiye ve Ücret
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Geçiş hesabı · resmi tarife
          </h2>
        </div>
        <span
          title="HGS bakiyesi PTT/HGS dışı sorgulanamıyor (kişisel veri). Ücretler operatör resmi tarifesi — 2026 güncel."
          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-mehtap/20 text-mehtap rounded-full px-2 py-0.5 ring-1 ring-mehtap/30"
        >
          Tarife: 2026
        </span>
      </header>

      {/* Bakiye sorgu */}
      <div className="pb-3">
        <div className="rounded-2xl ring-1 ring-line bg-card shadow-sm shadow-bogaz-deep/10 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-on-mute font-bold">
              Bakiye sorgu
            </div>
            <div className="text-sm font-semibold text-on mt-0.5">
              PTT/HGS hesabından
            </div>
            <div className="text-[11px] text-on-mute mt-0.5">
              Kişisel veri olduğu için doğrudan sorgu yapılamaz.
            </div>
          </div>
          <div className="flex flex-col gap-1.5 shrink-0">
            <a
              href={HGS_QUERY_URL}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3.5 py-1.5 hover:bg-vapur-soft transition text-center"
            >
              Bakiyemi sorgula ↗
            </a>
            <a
              href={HGS_OFFICIAL_HOME}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-cini font-semibold hover:text-vapur transition text-center"
            >
              hgs.ptt.gov.tr
            </a>
          </div>
        </div>
      </div>

      {/* Grup sekmeleri */}
      <div className="pb-2 flex gap-1.5">
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setOpen(g.id)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              open === g.id
                ? "bg-bogaz text-sis"
                : "bg-chip text-on-soft hover:bg-chip/80"
            }`}
          >
            {g.emoji} {g.lbl}
          </button>
        ))}
      </div>

      {/* Tarife listesi */}
      <ul className="pb-3 space-y-2">
        {tolls.map((t) => {
          const n = checked[t.id] ?? 0;
          const active = n > 0;
          return (
            <li
              key={t.id}
              className={`rounded-xl ring-1 bg-card px-4 py-2.5 transition ${
                active
                  ? "ring-cini/40 shadow-sm shadow-bogaz-deep/10"
                  : "ring-line hover:ring-bogaz-deep/15"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-on truncate">
                      {t.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-on-mute truncate">
                    {t.operator}
                    {t.description ? ` · ${t.description}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-on tabular-nums">
                    {t.class1Tl} ₺
                  </div>
                  <a
                    href={t.tariffUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] uppercase tracking-wider text-cini hover:text-vapur transition"
                  >
                    Resmi ↗
                  </a>
                </div>
              </div>

              {/* Geçtim sayacı */}
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-on-soft">
                  Bugün buradan{" "}
                  <strong className={active ? "text-cini" : "text-on"}>
                    {n}
                  </strong>{" "}
                  kez geçtim
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => inc(t.id, -1)}
                    disabled={n === 0}
                    className="size-7 rounded-full bg-chip text-on hover:bg-vapur-red/15 hover:text-vapur-red transition disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                    aria-label="Bir azalt"
                  >
                    −
                  </button>
                  <button
                    onClick={() => inc(t.id, 1)}
                    className="size-7 rounded-full bg-vapur text-bogaz-deep hover:bg-vapur-soft transition text-sm font-bold"
                    aria-label="Bir ekle"
                  >
                    +
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Toplam */}
      <div className="pb-4">
        <div
          className={`rounded-xl px-4 py-3 ring-1 transition ${
            passCount > 0
              ? "bg-bogaz text-sis ring-cini/30 shadow-md shadow-bogaz-deep/20"
              : "bg-chip text-on-soft ring-line"
          }`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-80">
                Bugünkü toplam
              </div>
              <div
                className={`font-display text-2xl font-semibold tabular-nums ${
                  passCount > 0 ? "text-vapur" : "text-on-mute"
                }`}
              >
                {total} <span className="text-sm font-normal opacity-70">₺</span>
              </div>
              <div className="text-[11px] opacity-70 mt-0.5">
                {passCount} geçiş işaretledin
              </div>
            </div>
            {passCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] font-semibold text-vapur-soft hover:text-vapur transition"
              >
                Sıfırla
              </button>
            )}
          </div>
        </div>
      </div>

      <footer className="px-1 pt-3 border-t border-line flex flex-wrap items-center justify-between gap-2 text-[11px] text-on-soft">
        <span>
          Tarife son güncelleme:{" "}
          <strong className="text-on">{HGS_TARIFF.updatedAt}</strong>
        </span>
        <span className="text-on-mute">{HGS_TARIFF.source}</span>
      </footer>
    </section>
  );
}
