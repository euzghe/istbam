"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Route as OsrmRoute } from "@/lib/route-source";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapOverlay } from "./MapOverlay";
import { SideNav } from "./SideNav";
import { IstanbulBackdrop } from "./IstanbulBackdrop";
import {
  PanelContext,
  type Destination,
  type LiveLocation,
} from "./PanelContext";
import { JUNCTIONS, type Junction } from "@/data/junctions";
import type { IsparkLive } from "@/lib/ispark-source";
import { haversineKm } from "@/lib/geo";

const SUGGESTIONS: Destination[] = [
  { label: "Edirnekapı O-3 Çıkışı (OSM canlı)", lng: 28.926, lat: 41.027, junctionId: "jct-edirnekapi-o3" },
  { label: "Cevizlibağ (OSM canlı)", lng: 28.918, lat: 41.001 },
  { label: "Sultanahmet", lng: 28.977, lat: 41.0058, junctionId: "jct-sultanahmet-cikis" },
  { label: "Taksim", lng: 28.9866, lat: 41.0367 },
  { label: "Kadıköy İskele", lng: 29.0247, lat: 40.9923, junctionId: "jct-kadikoy-iskele" },
  { label: "15 Temmuz Köprüsü", lng: 29.034, lat: 41.045, junctionId: "jct-15temmuz-girisi" },
  { label: "FSM Köprüsü", lng: 29.057, lat: 41.083, junctionId: "jct-fsm-girisi" },
  { label: "Mecidiyeköy", lng: 28.999, lat: 41.067, junctionId: "jct-mecidiyekoy" },
  { label: "Yenikapı Vapur İskele", lng: 28.95, lat: 40.998, junctionId: "jct-yenikapi-vapur" },
  { label: "Sabiha Gökçen Havalimanı", lng: 29.31, lat: 40.898 },
  { label: "İst. Havalimanı", lng: 28.747, lat: 41.275 },
];

const MAX_LANE_KM = 1.5;

export function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [destination, setDestinationState] = useState<Destination | null>(null);

  // Hedef seçilince Şerit Rehberi sayfasına yönlendir
  function setDestination(d: Destination | null) {
    setDestinationState(d);
    if (d) router.push("/panel");
  }

  const [selectedIsparkId, setSelectedIsparkId] = useState<number | undefined>();
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<LiveLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapTitle, setMapTitle] = useState<string | undefined>();
  const [isparks, setIsparks] = useState<IsparkLive[]>([]);
  const [isparkLoading, setIsparkLoading] = useState(true);
  const [sideOpen, setSideOpen] = useState(true);
  const [route, setRoute] = useState<OsrmRoute | null>(null);
  const lastRouteFetchRef = useRef<{ lng: number; lat: number; destKey: string } | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("istbam:sideOpen");
      if (raw != null) setSideOpen(raw === "1");
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("istbam:sideOpen", sideOpen ? "1" : "0");
    } catch {}
  }, [sideOpen]);

  // İBB'den canlı İSPARK listesi
  useEffect(() => {
    let alive = true;
    fetch("/api/ispark")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        if (Array.isArray(data.items)) setIsparks(data.items);
        setIsparkLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setIsparkLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Geolocation
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Tarayıcı konum desteklemiyor");
      return;
    }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setLive({
          lng: pos.coords.longitude,
          lat: pos.coords.latitude,
          accuracy: pos.coords.accuracy,
          source: "gps",
        });
        setGeoError(null);
      },
      (err) => setGeoError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  // OSRM rotası — sadece live + destination ikisi de varken, ve user >75m hareket ettiyse yenile
  useEffect(() => {
    if (!live || !destination) {
      setRoute(null);
      lastRouteFetchRef.current = null;
      return;
    }
    const destKey = `${destination.lng},${destination.lat}`;
    const last = lastRouteFetchRef.current;
    const destChanged = !last || last.destKey !== destKey;
    const movedFar = last
      ? haversineKm({ lng: live.lng, lat: live.lat }, { lng: last.lng, lat: last.lat }) * 1000 > 75
      : true;
    if (!destChanged && !movedFar) return;

    lastRouteFetchRef.current = { lng: live.lng, lat: live.lat, destKey };
    let alive = true;
    fetch(
      `/api/route?fromLng=${live.lng}&fromLat=${live.lat}&toLng=${destination.lng}&toLat=${destination.lat}`
    )
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (d?.error) setRoute(null);
        else setRoute(d as OsrmRoute);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [live?.lng, live?.lat, destination?.lng, destination?.lat]);

  // Sıradaki anlamlı manevra — kullanıcı konumuna en yakın "depart" sonrası adım
  const nextManeuver = useMemo(() => {
    if (!route || !live) return null;
    let best: { step: (typeof route.steps)[number]; distM: number } | null = null;
    for (let i = 0; i < route.steps.length; i++) {
      const step = route.steps[i];
      if (step.maneuver.type === "depart") continue;
      const [mlng, mlat] = step.maneuver.location;
      const distM = Math.round(
        haversineKm(live, { lng: mlng, lat: mlat }) * 1000
      );
      // Geride kalmış manevralar (5m altı, geçtin)
      if (distM < 5) continue;
      if (!best || distM < best.distM) best = { step, distM };
      // İlk anlamlı manevrayı seçtikten sonra ileri bakmaya gerek yok
      if (step.maneuver.type !== "continue" && step.maneuver.type !== "new name") {
        break;
      }
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route, live?.lng, live?.lat]);

  const reference = live
    ? { lng: live.lng, lat: live.lat }
    : destination
    ? { lng: destination.lng, lat: destination.lat }
    : null;

  const focus = destination
    ? { lng: destination.lng, lat: destination.lat, zoom: 14 }
    : live
    ? { lng: live.lng, lat: live.lat, zoom: 15 }
    : undefined;

  const nearestIsparks = useMemo(() => {
    if (!isparks.length) return [];
    if (!reference) {
      return isparks.slice(0, 3).map((p) => ({ ...p, distanceKm: 0 }));
    }
    return [...isparks]
      .map((p) => ({ ...p, distanceKm: haversineKm(reference, p) }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isparks, reference?.lng, reference?.lat]);

  // Öncelik:
  //  1. Hedef bir kavşağa işaret ediyorsa HER DURUMDA göster (uzakta olsa bile önizleme)
  //  2. Hedef yok ama canlı konumdaysan 1.5 km içindeki kavşağı göster
  //  3. Hedef konumu var (junctionId yok) → o civardaki yakın kavşak (1.5 km içinde)
  const activeJunction: { j: Junction; distanceM: number } | undefined = useMemo(() => {
    if (destination?.junctionId) {
      const j = JUNCTIONS.find((x) => x.id === destination.junctionId);
      if (!j) return undefined;
      // Mesafe: canlı varsa kullanıcıdan kavşağa, yoksa demo warnMeters
      const d = live ? haversineKm(live, j) * 1000 : j.warnMeters;
      return { j, distanceM: Math.round(d) };
    }
    if (live) {
      const sorted = [...JUNCTIONS]
        .map((j) => ({ j, dKm: haversineKm(live, j) }))
        .sort((a, b) => a.dKm - b.dKm);
      const best = sorted[0];
      if (!best || best.dKm > MAX_LANE_KM) return undefined;
      return { j: best.j, distanceM: Math.round(best.dKm * 1000) };
    }
    if (destination) {
      const sorted = [...JUNCTIONS]
        .map((j) => ({ j, dKm: haversineKm(destination, j) }))
        .sort((a, b) => a.dKm - b.dKm);
      const best = sorted[0];
      if (!best || best.dKm > MAX_LANE_KM) return undefined;
      return { j: best.j, distanceM: Math.round(best.dKm * 1000) };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination?.junctionId, destination?.lng, destination?.lat, live?.lng, live?.lat]);

  const filteredSugg = SUGGESTIONS.filter((s) =>
    s.label.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr"))
  );

  function openMapAll() {
    setMapTitle(
      live
        ? "Konumun çevresi"
        : destination
        ? `${destination.label} çevresi`
        : "İSPARK ve Kavşaklar"
    );
    setSelectedIsparkId(undefined);
    setMapOpen(true);
  }

  function openMapForIspark(id: number) {
    const p = isparks.find((x) => x.id === id);
    setMapTitle(p ? p.name : "Otopark Konumu");
    setSelectedIsparkId(id);
    setMapOpen(true);
  }

  const ctxValue = useMemo(
    () => ({
      live,
      geoError,
      destination,
      setDestination,
      isparks,
      isparkLoading,
      activeJunction,
      nearestIsparks,
      openMapAll,
      openMapForIspark,
      navigating: !!destination,
      route,
      nextManeuver,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      live,
      geoError,
      destination,
      isparks,
      isparkLoading,
      activeJunction,
      nearestIsparks,
      route,
      nextManeuver,
    ]
  );

  return (
    <PanelContext.Provider value={ctxValue}>
      <div className="flex flex-col h-screen bg-canvas">
        <TopBar
          destination={destination}
          setDestination={setDestination}
          query={query}
          setQuery={setQuery}
          suggestions={filteredSugg}
          live={live}
          geoError={geoError}
          onOpenMap={openMapAll}
          onMenu={() => setSideOpen((v) => !v)}
        />

        <div className="flex-1 flex overflow-hidden">
          <SideNav open={sideOpen} setOpen={setSideOpen} />

          <main className="flex-1 overflow-y-auto bg-canvas-rich relative">
            <IstanbulBackdrop />
            <div className="relative z-10 mx-auto w-full max-w-3xl px-4 sm:px-6 py-6 sm:py-8 space-y-6">
              {children}
            </div>
          </main>
        </div>

        <MapOverlay
          open={mapOpen}
          onClose={() => setMapOpen(false)}
          isparks={isparks}
          focus={
            selectedIsparkId != null
              ? (() => {
                  const p = isparks.find((x) => x.id === selectedIsparkId);
                  return p ? { lng: p.lng, lat: p.lat, zoom: 16 } : focus;
                })()
              : focus
          }
          selectedIsparkId={selectedIsparkId}
          setSelectedIsparkId={setSelectedIsparkId}
          title={mapTitle}
          live={live ? { lng: live.lng, lat: live.lat } : undefined}
        />
      </div>
    </PanelContext.Provider>
  );
}

function TopBar({
  destination,
  setDestination,
  query,
  setQuery,
  suggestions,
  live,
  geoError,
  onOpenMap,
  onMenu,
}: {
  destination: Destination | null;
  setDestination: (d: Destination | null) => void;
  query: string;
  setQuery: (q: string) => void;
  suggestions: Destination[];
  live: LiveLocation | null;
  geoError: string | null;
  onOpenMap: () => void;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <header className="bg-bogaz-deep text-sis px-4 py-3 shadow-md shrink-0 relative z-50">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenu}
          className="size-9 rounded-full hover:bg-sis/10 text-sis transition flex items-center justify-center shrink-0"
          aria-label="Bölüm menüsü"
          title="Bölümler"
        >
          <span className="text-lg leading-none">☰</span>
        </button>
        <Link href="/" className="shrink-0">
          <Logo variant="light" size={26} />
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs">
          {live ? (
            <>
              <span className="size-2 rounded-full bg-cini animate-pulse" />
              <span className="text-sis/70">
                Konum açık · ±{Math.round(live.accuracy)} m
              </span>
            </>
          ) : geoError ? (
            <>
              <span className="size-2 rounded-full bg-vapur-red" />
              <span className="text-sis/60" title={geoError}>
                Konum kapalı
              </span>
            </>
          ) : (
            <>
              <span className="size-2 rounded-full bg-vapur animate-pulse" />
              <span className="text-sis/70">Konum bekleniyor…</span>
            </>
          )}
        </div>

        <div className="relative flex-1 max-w-xl">
          <div className="flex items-center gap-3 bg-sis/8 hover:bg-sis/12 transition rounded-full px-4 py-2 ring-1 ring-sis/15">
            <span className="text-vapur text-sm">→</span>
            <input
              type="text"
              value={query || destination?.label || ""}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Hedef yazın: Sultanahmet, Kadıköy, FSM…"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-sis/50"
            />
            {destination && !query && (
              <button
                onClick={() => {
                  setDestination(null);
                  setQuery("");
                }}
                className="text-xs text-sis/60 hover:text-vapur transition shrink-0"
                aria-label="Hedefi temizle"
              >
                ×
              </button>
            )}
          </div>

          {open && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card text-on rounded-card ring-1 ring-line shadow-xl shadow-bogaz-deep/20 max-h-80 overflow-y-auto z-30">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setDestination(s);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-chip transition flex items-center justify-between border-b border-line last:border-0"
                >
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-[10px] text-on-mute uppercase tracking-wider">
                    {s.junctionId ? "Şerit verisi var" : "Konum"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onOpenMap}
          className="inline-flex items-center gap-1.5 rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
          aria-label="Haritayı aç"
        >
          <span>🗺</span>
          <span className="hidden sm:inline">Harita</span>
        </button>

        <ThemeToggle variant="light-bar" />
      </div>
    </header>
  );
}

// Konum izni yokken gösterilen banner — herhangi bir sayfada kullanılabilir
export function LocationBanner() {
  return null;
}
