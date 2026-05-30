"use client";

import { useEffect, useMemo, useState } from "react";
import type { Junction } from "../PanelContext";
import type { OsmLane, OsmLanesEmpty, OsmLanesResult } from "@/lib/overpass";
import { turnArrow, turnLabelTr } from "@/lib/overpass";
import { NaviMini } from "../NaviMini";

type Source = "osm" | "manual" | "demo" | "loading" | "empty";

type UnifiedLane = {
  no: number;
  arrow: string; // ↑ ← → ↖ ↗
  arrowLabel: string; // "Düz devam"
  primary: string; // büyük metin (hedef veya ref)
  secondary?: string;
};

export function LaneCard({
  junction,
  destinationLabel,
  userLng,
  userLat,
  liveDistanceM,
  navigating,
  routeGeometry,
  maneuverLngLat,
}: {
  junction: Junction;
  destinationLabel?: string;
  userLng?: number;
  userLat?: number;
  liveDistanceM?: number;
  navigating?: boolean;
  routeGeometry?: { type: "LineString"; coordinates: [number, number][] };
  maneuverLngLat?: [number, number];
}) {
  const [voice, setVoice] = useState(false);
  const hasLive = liveDistanceM != null;
  const [distance, setDistance] = useState(
    hasLive ? liveDistanceM : junction.warnMeters
  );
  const [osm, setOsm] = useState<OsmLanesResult | null>(null);
  const [source, setSource] = useState<Source>("loading");
  const [osmReason, setOsmReason] = useState<string | undefined>();

  // OSM fetch — kavşak değişince (manuel veri varsa atla)
  useEffect(() => {
    let alive = true;

    // Eğer kavşağın manuel şerit verisi varsa OSM'e sormaya gerek yok
    if (junction.manualLanes?.length) {
      setOsm(null);
      setSource("manual");
      return;
    }

    setSource("loading");
    setOsm(null);
    setOsmReason(undefined);

    fetch(`/api/lanes?lat=${junction.lat}&lng=${junction.lng}`)
      .then((r) => r.json())
      .then((data: OsmLanesResult | OsmLanesEmpty) => {
        if (!alive) return;
        if (data.source === "osm" && data.lanes?.length) {
          setOsm(data);
          setSource("osm");
        } else {
          setSource("demo");
          if ("reason" in data) setOsmReason(data.reason);
        }
      })
      .catch((e) => {
        if (!alive) return;
        setSource("demo");
        setOsmReason(String(e));
      });

    return () => {
      alive = false;
    };
  }, [junction.id, junction.lat, junction.lng, junction.manualLanes]);

  // Unified lane'ler — öncelik: manuel veritabanı → OSM canlı → OSRM fallback
  const unified: UnifiedLane[] = useMemo(() => {
    // 1. Elle hazırlanmış İstbam kavşak veritabanı (en doğru)
    if (junction.manualLanes?.length) {
      return junction.manualLanes.map((m) => ({
        no: m.no,
        arrow: m.arrow,
        arrowLabel: m.destinations[0] ?? "",
        primary: m.destinations[0] ?? "",
        secondary: m.destinations.slice(1).join(" · ") || undefined,
      }));
    }
    // 2. OSM Overpass turn:lanes canlı verisi
    if (osm && osm.lanes.length) return osm.lanes.map(osmToUnified);
    // 3. Fallback: OSRM rota noktası, tek "Yola devam" şerit
    return [
      {
        no: 1,
        arrow: "↑",
        arrowLabel: "Yola devam",
        primary: junction.name || "Yol devam",
      },
    ];
  }, [osm, junction.manualLanes, junction.name]);

  const positions = positionLabels(unified.length);

  // Önerilen şerit — OSM canlı varsa onun üzerinden; yoksa tek-şerit fallback (0)
  const suggestedIdx = useMemo(() => {
    if (osm && osm.lanes.length) return pickFromOsm(osm.lanes, destinationLabel);
    return 0;
  }, [osm, destinationLabel]);

  const suggestedPos = suggestedIdx >= 0 ? positions[suggestedIdx] : undefined;
  const suggestedUnified = suggestedIdx >= 0 ? unified[suggestedIdx] : undefined;

  // Mesafe kaynağı: canlı varsa gerçek, yoksa demo animasyon
  useEffect(() => {
    if (hasLive) {
      setDistance(liveDistanceM!);
      return;
    }
    setDistance(junction.warnMeters);
    const id = setInterval(() => {
      setDistance((d) => (d <= 30 ? junction.warnMeters : Math.max(0, d - 25)));
    }, 800);
    return () => clearInterval(id);
  }, [hasLive, liveDistanceM, junction.warnMeters, junction.id]);

  function speak() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const action = suggestedUnified
      ? `${suggestedPos} şeride geç. ${
          suggestedUnified.primary || suggestedUnified.arrowLabel
        }.`
      : `Şerit seçimi yapın.`;
    const text = `Dikkat. ${distance} metre sonra ${junction.name}. ${action}`;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "tr-TR";
    u.rate = 1.05;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  // İlerleme: kavşağa kalan mesafenin warn'a oranı.
  // Uzaktaysa progress 0 (yaklaşmadın), yakındaysa dolar.
  const progress = Math.min(1, Math.max(0, 1 - distance / junction.warnMeters));
  const roadHeading = osm?.roadName || osm?.roadRef;

  return (
    <section
      className={`rounded-card overflow-hidden bg-bogaz text-sis shadow-lg shadow-bogaz-deep/15 ring-1 transition ${
        navigating
          ? "ring-vapur/60 shadow-[0_0_0_2px_rgba(245,165,36,0.18)]"
          : "ring-bogaz-deep/20"
      }`}
    >
      {navigating && (
        <div className="bg-vapur text-bogaz-deep text-[10px] font-bold uppercase tracking-widest px-5 py-1.5 flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-bogaz-deep animate-pulse" />
          Yönlendirme aktif {destinationLabel ? `· "${destinationLabel}"` : ""}
        </div>
      )}

      {/* HARİTA EN ÜSTE — sayfa açılınca ilk göreceğin şey */}
      <NaviMini
        junctionLat={junction.lat}
        junctionLng={junction.lng}
        junctionName={junction.name}
        userLng={userLng}
        userLat={userLat}
        distanceM={distance}
        routeGeometry={routeGeometry}
        maneuverLngLat={maneuverLngLat}
      />

      {/* Şeritte ol — büyük amber band, haritanın hemen altında */}
      {suggestedUnified && suggestedPos && (
        <div className="px-5 pt-3 pb-2">
          <div className="rounded-xl bg-vapur text-bogaz-deep px-4 py-3 flex items-center gap-3">
            <div className="size-12 rounded-full bg-bogaz-deep text-vapur flex items-center justify-center font-bold text-2xl shrink-0">
              {suggestedUnified.arrow}
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-[10px] uppercase tracking-widest font-bold opacity-70">
                {fmtDistance(distance)} sonra
              </div>
              <div className="font-display text-xl font-semibold">
                {suggestedPos} şeritte ol
              </div>
              <div className="text-xs opacity-85 truncate">
                {suggestedUnified.primary || suggestedUnified.arrowLabel}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kavşak başlığı + kaynak rozeti — küçük */}
      <header className="px-5 pt-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-vapur font-semibold">
              <span className="inline-block size-1.5 rounded-full bg-vapur animate-pulse" />
              Şerit Rehberi
            </div>
            <h2 className="mt-1 font-display text-base font-semibold leading-tight">
              {junction.name}
            </h2>
            <p className="text-[11px] text-sis/60 mt-0.5 truncate">
              {roadHeading ? (
                <>
                  <span className="text-cini-soft">{roadHeading}</span>
                  {" · "}
                </>
              ) : null}
              {junction.approach}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <SourceBadge source={source} reason={osmReason} />
            <button
              onClick={() => {
                setVoice((v) => {
                  const next = !v;
                  if (next) setTimeout(speak, 50);
                  return next;
                });
              }}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                voice
                  ? "bg-vapur text-bogaz-deep"
                  : "bg-sis/10 text-sis/70 hover:bg-sis/15"
              }`}
            >
              {voice ? "🔊 Sesli" : "🔇"}
            </button>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="font-mono text-base font-semibold text-vapur tabular-nums shrink-0">
            {fmtDistance(distance)}
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-sis/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cini to-vapur transition-all duration-700"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[9px] uppercase tracking-wider text-sis/55 shrink-0">
            {distance > junction.warnMeters * 3 ? "Hedef" : "Kavşak"}
          </span>
        </div>
      </header>

      <div className="px-5 pb-3 space-y-1.5">
        {unified.map((lane, i) => {
          const pos = positions[i];
          const isSuggested = suggestedIdx === i;
          return (
            <div
              key={lane.no}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 ring-1 transition ${
                isSuggested
                  ? "bg-vapur/12 ring-vapur/50"
                  : "bg-sis/5 ring-sis/10"
              }`}
            >
              <div
                className={`text-[10px] font-bold uppercase tracking-wider w-20 shrink-0 ${
                  isSuggested ? "text-vapur" : "text-sis/55"
                }`}
              >
                {pos}
              </div>
              <span
                className={`text-base shrink-0 w-5 text-center ${
                  isSuggested ? "text-vapur" : "text-sis/60"
                }`}
              >
                {lane.arrow}
              </span>
              <div className="text-xs text-sis/90 leading-tight flex-1 truncate">
                {lane.primary || lane.arrowLabel}
                {lane.secondary && (
                  <span className="text-sis/55"> · {lane.secondary}</span>
                )}
              </div>
              {isSuggested && (
                <span className="text-[10px] font-bold text-vapur shrink-0">
                  ← SEN
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Tuzak uyarısı — sık kaçırılan şerit kararı için (manuel kavşaktan) */}
      {junction.trap && (
        <div className="mx-5 mb-3 mt-1 flex items-start gap-2 rounded-lg bg-vapur-red/12 ring-1 ring-vapur-red/30 px-3 py-2">
          <span className="text-vapur-red text-sm leading-none mt-0.5 font-bold shrink-0">
            ⚠
          </span>
          <p className="text-[12px] text-sis/90 leading-snug">
            <strong className="text-vapur-soft">Tuzak: </strong>
            {junction.trap}
          </p>
        </div>
      )}

      <div className="bg-bogaz-deep/50 px-5 py-2.5 flex items-center justify-between text-[11px]">
        <span className="text-sis/60">
          Veri kaynağı:{" "}
          {source === "manual" ? (
            <span className="text-vapur font-semibold">
              İstbam veritabanı · doğrulanmış kavşak
            </span>
          ) : source === "osm" ? (
            <a
              href={`https://www.openstreetmap.org/way/${osm?.osmWayId}`}
              target="_blank"
              rel="noreferrer"
              className="text-cini-soft font-semibold hover:text-cini"
            >
              OpenStreetMap (way #{osm?.osmWayId})
            </a>
          ) : source === "loading" ? (
            <span className="text-sis/60">OSM yükleniyor…</span>
          ) : (
            <span className="text-cini-soft">OSRM rotası (OSM şerit yok)</span>
          )}
        </span>
        <button
          onClick={speak}
          className="text-vapur-soft hover:text-vapur font-semibold"
        >
          Tekrar dinlet
        </button>
      </div>
    </section>
  );
}

// ---------- Yol görünümü ----------

function RoadView({
  lanes,
  suggestedIdx,
  positions,
}: {
  lanes: UnifiedLane[];
  suggestedIdx: number;
  positions: string[];
}) {
  const cols = lanes.length;
  return (
    <div className="px-5 mt-4 mb-3">
      <div className="relative rounded-xl overflow-hidden bg-bogaz-deep ring-1 ring-sis/10">
        <div className="aspect-[16/9] relative">
          <div className="absolute inset-0 bg-[#1a2640]" />
          <div
            className="absolute inset-0 grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {lanes.map((lane, i) => {
              const isSuggested = suggestedIdx === i;
              return (
                <div
                  key={lane.no}
                  className="relative border-r border-dashed border-sis/20 last:border-r-0"
                >
                  {isSuggested && (
                    <>
                      <div className="absolute inset-x-2 top-0 bottom-0 rounded-md bg-gradient-to-b from-vapur/35 via-vapur/15 to-vapur/35 ring-1 ring-vapur/50 shadow-[0_0_24px_-4px] shadow-vapur" />
                      <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[repeating-linear-gradient(to_bottom,theme(colors.vapur)_0_8px,transparent_8px_16px)] opacity-80" />
                    </>
                  )}

                  {/* Üst: hedef */}
                  <div
                    className={`absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold uppercase tracking-wider text-center leading-tight px-1 z-10 ${
                      isSuggested ? "text-vapur" : "text-sis/75"
                    }`}
                  >
                    {lane.primary || lane.arrowLabel}
                  </div>

                  {/* Yön oku — OSM turn'a göre */}
                  <div
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl z-10 ${
                      isSuggested
                        ? "text-vapur drop-shadow-[0_0_8px_rgba(245,165,36,0.7)]"
                        : "text-sis/45"
                    }`}
                  >
                    {lane.arrow}
                  </div>

                  {isSuggested && (
                    <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 z-10">
                      <CarIcon className="text-vapur drop-shadow-[0_0_6px_rgba(245,165,36,0.8)]" />
                      <span className="text-[9px] font-bold text-vapur uppercase tracking-wider">
                        SEN
                      </span>
                    </div>
                  )}

                  <div
                    className={`absolute bottom-0 left-0 right-0 text-center py-1 z-10 ${
                      isSuggested ? "bg-vapur text-bogaz-deep" : "bg-bogaz-deep/70"
                    }`}
                  >
                    <div
                      className={`text-[9px] font-bold uppercase tracking-wider ${
                        isSuggested ? "text-bogaz-deep" : "text-sis/70"
                      }`}
                    >
                      {positions[i]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute top-0 bottom-0 left-0 w-1 bg-vapur/30" />
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-vapur/30" />
        </div>

        <div className="absolute top-2 right-2 text-[8px] uppercase tracking-widest text-sis/40 bg-bogaz-deep/60 px-1.5 py-0.5 rounded">
          ↑ Sürüş yönü
        </div>
      </div>
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <rect x="7" y="3" width="10" height="18" rx="2.5" />
      <rect x="8.5" y="5" width="7" height="4" rx="1" fill="#0a1d3a" opacity="0.6" />
      <rect x="8.5" y="14" width="7" height="4" rx="1" fill="#0a1d3a" opacity="0.6" />
      <circle cx="9" cy="11" r="0.7" fill="#0a1d3a" opacity="0.6" />
      <circle cx="15" cy="11" r="0.7" fill="#0a1d3a" opacity="0.6" />
    </svg>
  );
}

function SourceBadge({ source, reason }: { source: Source; reason?: string }) {
  const map: Record<Source, { lbl: string; bg: string; color: string }> = {
    manual: {
      lbl: "İstbam ✓",
      bg: "bg-vapur/15",
      color: "text-vapur",
    },
    osm: {
      lbl: "OSM şerit",
      bg: "bg-cini/15",
      color: "text-cini",
    },
    demo: {
      lbl: "OSRM rotası",
      bg: "bg-cini-soft/15",
      color: "text-cini-soft",
    },
    loading: {
      lbl: "OSM…",
      bg: "bg-sis/10",
      color: "text-sis/70",
    },
    empty: {
      lbl: "OSRM rotası",
      bg: "bg-cini-soft/15",
      color: "text-cini-soft",
    },
  };
  const x = map[source];
  return (
    <span
      title={
        source === "manual"
          ? "İstbam editör veritabanı — bu kavşak için doğrulanmış şerit-hedef bilgisi"
          : source === "demo"
          ? `OSM'de bu noktanın şerit etiketi yok. Yönlendirme OSRM rotasından (gerçek).`
          : source === "osm"
          ? "OpenStreetMap'ten canlı çekildi — gerçek turn:lanes verisi"
          : undefined
      }
      className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 ring-1 ${x.bg} ${x.color}`}
    >
      {x.lbl}
    </span>
  );
}

// ---------- Lane çevrim ----------

function osmToUnified(l: OsmLane): UnifiedLane {
  return {
    no: l.no,
    arrow: turnArrow(l.turn),
    arrowLabel: turnLabelTr(l.turn),
    primary: l.destination ?? l.ref ?? turnLabelTr(l.turn),
    secondary: l.ref && l.destination ? l.ref : undefined,
  };
}

// ---------- Hedef → şerit eşleme ----------

function pickFromOsm(lanes: OsmLane[], dest?: string): number {
  if (!dest) {
    // hedef yoksa "düz devam"ı öner
    return lanes.findIndex((l) => l.turn === "through") >= 0
      ? lanes.findIndex((l) => l.turn === "through")
      : 0;
  }
  const d = dest.toLocaleLowerCase("tr");
  // Destination string'ine bak (OSM'de gerçek tabela metni)
  for (let i = 0; i < lanes.length; i++) {
    const text = `${lanes[i].destination ?? ""} ${lanes[i].ref ?? ""}`.toLocaleLowerCase("tr");
    if (!text.trim()) continue;
    if (text.includes(d) || d.split(" ").some((w) => w.length > 2 && text.includes(w))) {
      return i;
    }
  }
  // Match olmazsa "düz" varsayılan
  const through = lanes.findIndex((l) => l.turn === "through");
  return through >= 0 ? through : 0;
}

// 0–999 m: "523 m" · 1000+ m: "12.4 km"
function fmtDistance(m: number): React.ReactNode {
  if (m < 1000) {
    return (
      <>
        {Math.round(m)}
        <span className="text-sm text-sis/60 ml-1">m</span>
      </>
    );
  }
  return (
    <>
      {(m / 1000).toFixed(1)}
      <span className="text-sm text-sis/60 ml-1">km</span>
    </>
  );
}

// EN SOL, ORTA SOL, ORTA, ORTA SAĞ, EN SAĞ
function positionLabels(n: number): string[] {
  if (n === 1) return ["TEK"];
  if (n === 2) return ["SOL", "SAĞ"];
  if (n === 3) return ["EN SOL", "ORTA", "EN SAĞ"];
  if (n === 4) return ["EN SOL", "ORTA SOL", "ORTA SAĞ", "EN SAĞ"];
  if (n === 5) return ["EN SOL", "ORTA SOL", "ORTA", "ORTA SAĞ", "EN SAĞ"];
  return Array.from({ length: n }, (_, i) => {
    if (i === 0) return "EN SOL";
    if (i === n - 1) return "EN SAĞ";
    return `${i + 1}.`;
  });
}
