"use client";

import { useEffect, useState } from "react";
import type {
  IsparkDetail,
  IsparkLive,
  IsparkParkType,
  TariffTier,
} from "@/lib/ispark-source";

type Item = IsparkLive & { distanceKm?: number };

export function IsparkCard({
  items,
  destinationLabel,
  loading,
  onShowMap,
  onShowOnMap,
}: {
  items: Item[];
  destinationLabel?: string;
  loading?: boolean;
  onShowMap?: () => void;
  onShowOnMap?: (id: number) => void;
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, IsparkDetail | "loading" | "error">>({});

  useEffect(() => {
    if (expandedId == null) return;
    const cur = details[expandedId];
    if (cur && cur !== "error") return;
    setDetails((d) => ({ ...d, [expandedId]: "loading" }));
    fetch(`/api/ispark/${expandedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDetails((d) => ({ ...d, [expandedId]: data as IsparkDetail }));
      })
      .catch(() => {
        setDetails((d) => ({ ...d, [expandedId]: "error" }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandedId]);

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-semibold">
            <span className="inline-block size-1.5 rounded-full bg-cini animate-pulse" />
            İSPARK · Yakın {items.length || 3}
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            {destinationLabel
              ? <>"{destinationLabel}" yakını</>
              : "Yakındaki otoparklar"}
          </h2>
        </div>
        <span
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-cini/15 text-cini rounded-full px-2 py-0.5 ring-1 ring-cini/30"
          title="Veri kaynağı: İBB Açık Veri — İSPARK API (canlı)"
        >
          İBB canlı
        </span>
      </header>

      {loading && items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-on-mute">
          İBB'den canlı İSPARK verisi yükleniyor…
        </div>
      ) : items.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-on-mute">
          Yakında otopark bulunamadı.
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((p) => {
            const occupied = p.capacity - p.emptyCapacity;
            const pct = p.capacity ? Math.round((occupied / p.capacity) * 100) : 0;
            const status =
              p.emptyCapacity === 0
                ? "Tamamen dolu"
                : pct >= 90
                ? "Neredeyse dolu"
                : pct >= 65
                ? "Yarı dolu"
                : pct >= 30
                ? "Boş yer var"
                : "Bol boş";
            const ringColor =
              pct >= 90 ? "bg-vapur-red" : pct >= 65 ? "bg-vapur" : "bg-cini";
            const statusColor =
              pct >= 90 ? "text-vapur-red" : pct >= 65 ? "text-vapur" : "text-cini";
            const isExpanded = expandedId === p.id;
            return (
              <li
                key={p.id}
                className={`rounded-xl ring-1 transition ${
                  isExpanded ? "bg-card ring-cini/40 shadow-md shadow-bogaz-deep/10" : "bg-card/70 ring-line hover:bg-card hover:ring-line"
                } px-4 py-3`}
              >
                <button
                  className="w-full text-left cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  title={isExpanded ? "Kapat" : "Detayı aç"}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block size-2 rounded-full ${ringColor}`} />
                        <h3 className="font-semibold text-on truncate">
                          {p.name}
                        </h3>
                      </div>
                      <div className="text-xs text-on-soft mt-0.5 truncate">
                        {p.district} · {typeLabel(p.parkType)}
                        {p.distanceKm != null && (
                          <> · {fmtDist(p.distanceKm)}</>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-[11px] font-bold uppercase tracking-wider leading-none ${statusColor}`}
                      >
                        {status}
                      </div>
                      <div className="font-mono text-sm text-on mt-1 tabular-nums">
                        <strong>{p.emptyCapacity}</strong>
                        <span className="text-on-mute"> boş / {p.capacity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 rounded-full bg-line overflow-hidden">
                    <div
                      className={`h-full ${ringColor} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <DetailPanel
                    state={details[p.id]}
                    base={p}
                    onShowOnMap={() => onShowOnMap?.(p.id)}
                  />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <footer className="px-1 pt-3 flex items-center justify-between text-[11px] text-on-soft border-t border-line mt-3">
        <span>Yeşil: boş · Sarı: yarı · Kırmızı: dolu</span>
        <button
          onClick={onShowMap}
          className="font-semibold text-cini hover:text-vapur transition"
        >
          Tüm 258 İSPARK haritada →
        </button>
      </footer>
    </section>
  );
}

function DetailPanel({
  state,
  base,
  onShowOnMap,
}: {
  state: IsparkDetail | "loading" | "error" | undefined;
  base: IsparkLive;
  onShowOnMap: () => void;
}) {
  if (state === "loading" || !state) {
    return (
      <div className="mt-3 rounded-lg bg-card ring-1 ring-line p-3 text-xs text-on-mute">
        Tarife yükleniyor…
      </div>
    );
  }
  if (state === "error") {
    return (
      <div className="mt-3 rounded-lg bg-vapur-red/8 ring-1 ring-vapur-red/30 p-3 text-xs text-vapur-red">
        Tarife alınamadı. Tekrar dene.
      </div>
    );
  }

  const d = state;
  const tariff = d.tariff ?? [];
  // Kısa / uzun / aylık ayrımı
  const short = tariff.filter((t) => /^0-1|^1-2|^2-4|saat/i.test(t.rangeLabel) && hourSpan(t.rangeLabel) <= 4);
  const long = tariff.filter((t) => hourSpan(t.rangeLabel) > 4 || /tam/i.test(t.rangeLabel));

  return (
    <div className="mt-3 rounded-lg bg-card ring-1 ring-line p-3 space-y-3">
      {/* Kısa süreli */}
      {short.length > 0 && (
        <TariffGroup title="Kısa süreli" tiers={short} />
      )}
      {/* Uzun süreli */}
      {long.length > 0 && (
        <TariffGroup title="Uzun süreli / Tam gün" tiers={long} />
      )}

      {/* Aylık + ek bilgi */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {d.monthlyFee != null && d.monthlyFee > 0 && (
          <MiniStat
            label="Aylık abonelik"
            value={`${fmtTl(d.monthlyFee)} ₺`}
            tone="amber"
          />
        )}
        {d.freeTimeMin ? (
          <MiniStat label="Ücretsiz süre" value={`${d.freeTimeMin} dk`} />
        ) : null}
        {d.workHours && <MiniStat label="Çalışma" value={d.workHours} />}
        <MiniStat label="Tip" value={base.parkTypeRaw} />
      </div>

      {d.address && (
        <div className="text-[11px] text-on-soft leading-relaxed">
          <span className="text-on-mute uppercase tracking-wider text-[9px] font-bold mr-1">
            Adres
          </span>
          {d.address}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-1">
        <div className="text-[10px] text-on-mute">
          {d.updateDate ? (
            <>İBB'den güncel: <span className="font-mono">{d.updateDate}</span></>
          ) : (
            "İBB canlı veri"
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowOnMap}
            className="rounded-full bg-cini text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-cini-soft transition"
          >
            🗺 Haritada
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${d.lat},${d.lng}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-vapur text-bogaz-deep font-semibold text-[11px] px-3 py-1.5 hover:bg-vapur-soft transition"
          >
            Yol tarifi
          </a>
        </div>
      </div>
    </div>
  );
}

function TariffGroup({ title, tiers }: { title: string; tiers: TariffTier[] }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-on-mute font-bold mb-1.5">
        {title}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
        {tiers.map((t) => (
          <div
            key={t.rangeLabel}
            className="flex items-baseline justify-between rounded-md bg-chip ring-1 ring-line px-2.5 py-1.5"
          >
            <span className="text-[11px] text-on-soft truncate">
              {t.rangeLabel}
            </span>
            <span className="text-xs font-semibold text-on tabular-nums">
              {fmtTl(t.priceTl)} ₺
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "amber";
}) {
  return (
    <div
      className={`rounded-md ring-1 px-2.5 py-1.5 ${
        tone === "amber"
          ? "bg-vapur/10 ring-vapur/30"
          : "bg-chip ring-line"
      }`}
    >
      <div className="text-[9px] uppercase tracking-wider text-on-mute font-bold">
        {label}
      </div>
      <div className="text-xs font-semibold text-on truncate">{value}</div>
    </div>
  );
}

function typeLabel(t: IsparkParkType) {
  switch (t) {
    case "kapali":
      return "Kapalı";
    case "acik":
      return "Açık";
    case "yol-ustu":
      return "Yol üstü";
    default:
      return "Diğer";
  }
}

function fmtDist(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function fmtTl(n: number) {
  return n.toLocaleString("tr-TR", { maximumFractionDigits: 0 });
}

function hourSpan(label: string): number {
  // "0-1 Saat" → 1, "4-8 Saat" → 8, "Tam Gün" → 24
  if (/tam/i.test(label)) return 24;
  const m = label.match(/(\d+)\s*-\s*(\d+)/);
  if (m) return parseInt(m[2], 10);
  const single = label.match(/(\d+)/);
  return single ? parseInt(single[1], 10) : 0;
}
