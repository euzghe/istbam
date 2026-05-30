"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Route as OsrmRoute, RouteStep } from "@/lib/route-source";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MapOverlay } from "./MapOverlay";
import { TrafficMapOverlay } from "./TrafficMapOverlay";
import { SideNav } from "./SideNav";
import { IstanbulBackdrop } from "./IstanbulBackdrop";
import { VoiceNavigation } from "./VoiceNavigation";
import {
  PanelContext,
  type Destination,
  type LiveLocation,
  type Junction,
  DECISION_TYPES,
} from "./PanelContext";
import type { GeoHit } from "@/lib/geocode-source";
import type { IsparkLive } from "@/lib/ispark-source";
import { haversineKm } from "@/lib/geo";
import { POPULAR_PLACES, searchPopular, type PopularPlace } from "@/data/popular-places";
import { matchManualJunction } from "@/data/manual-junctions";

export function PanelShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [destination, setDestinationState] = useState<Destination | null>(null);

  function setDestination(d: Destination | null) {
    setDestinationState(d);
    if (d) {
      router.push("/panel/serit-rehberi");
      // Mobilde drawer açıksa kapat ki sayfa içeriği görünsün
      if (
        typeof window !== "undefined" &&
        window.matchMedia("(max-width: 1023px)").matches
      ) {
        setSideOpen(false);
      }
    }
  }

  const [selectedIsparkId, setSelectedIsparkId] = useState<number | undefined>();
  const [query, setQuery] = useState("");
  const [live, setLive] = useState<LiveLocation | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapTitle, setMapTitle] = useState<string | undefined>();
  const [trafficMapOpen, setTrafficMapOpen] = useState(false);
  const [isparks, setIsparks] = useState<IsparkLive[]>([]);
  const [isparkLoading, setIsparkLoading] = useState(true);
  // Varsayılan kapalı — mount sonrası ekran boyutuna göre güncellenir
  // (mobilde kapalı, masaüstünde açık). Bu hidrasyon uyumsuzluğunu önler.
  const [sideOpen, setSideOpen] = useState(false);
  const [route, setRoute] = useState<OsrmRoute | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const lastRouteFetchRef = useRef<{ lng: number; lat: number; destKey: string } | null>(null);

  // İlk mount: localStorage tercihi varsa onu; yoksa ekran boyutu varsayılanı
  // (mobil < 1024px → kapalı, masaüstü → açık)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("istbam:sideOpen");
      if (raw === "1") setSideOpen(true);
      else if (raw === "0") setSideOpen(false);
      else {
        const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
        setSideOpen(isDesktop);
      }
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("istbam:sideOpen", sideOpen ? "1" : "0");
    } catch {}
  }, [sideOpen]);

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

  // OSRM rotası — AbortController + finally + timeout
  useEffect(() => {
    if (!live || !destination) {
      setRoute(null);
      setRouteError(null);
      setRouteLoading(false);
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
    setRouteLoading(true);
    setRouteError(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12_000);

    fetch(
      `/api/route?fromLng=${live.lng}&fromLat=${live.lat}&toLng=${destination.lng}&toLat=${destination.lat}`,
      { signal: controller.signal }
    )
      .then((r) => r.json())
      .then((d) => {
        if (d?.error) {
          setRoute(null);
          setRouteError(d.error);
        } else {
          setRoute(d as OsrmRoute);
          setRouteError(null);
        }
      })
      .catch((e: unknown) => {
        const name = (e as { name?: string })?.name;
        if (name === "AbortError") {
          // Yeni fetch tetiklendi veya timeout — eski hata yazma
          return;
        }
        setRoute(null);
        setRouteError(
          String((e as { message?: string })?.message ?? e ?? "Bilinmeyen hata")
        );
      })
      .finally(() => {
        clearTimeout(timeoutId);
        // Her durumda loading sonlandır — sonsuz spinner olmasın
        setRouteLoading(false);
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [live?.lng, live?.lat, destination?.lng, destination?.lat]);

  const upcomingDecisions = useMemo<{ step: RouteStep; distM: number }[]>(() => {
    if (!route || !live) return [];
    const decisions: { step: RouteStep; distM: number }[] = [];
    let firstNonDepart: { step: RouteStep; distM: number } | null = null;
    for (let i = 0; i < route.steps.length; i++) {
      const step = route.steps[i];
      if (step.maneuver.type === "depart") continue;
      const [mlng, mlat] = step.maneuver.location;
      const distM = Math.round(
        haversineKm(live, { lng: mlng, lat: mlat }) * 1000
      );
      if (distM < 5) continue;
      if (!firstNonDepart) firstNonDepart = { step, distM };
      if (!DECISION_TYPES.has(step.maneuver.type)) continue;
      decisions.push({ step, distM });
      if (decisions.length >= 4) break;
    }
    // Karar yoksa ilk anlamlı adımı göster ki kullanıcı boş ekran görmesin
    if (decisions.length === 0 && firstNonDepart) {
      decisions.push(firstNonDepart);
    }
    decisions.sort((a, b) => a.distM - b.distM);
    return decisions;
  }, [route, live?.lng, live?.lat]);

  const nextManeuver = upcomingDecisions[0] ?? null;

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
  }, [isparks, reference?.lng, reference?.lat]);

  // activeJunction: ONLY route-based artık. Hardcoded junctions yok.
  const activeJunction: { j: Junction; distanceM: number } | undefined = useMemo(() => {
    if (!nextManeuver) return undefined;
    const [mlng, mlat] = nextManeuver.step.maneuver.location;
    const roadName =
      nextManeuver.step.name?.trim() ||
      nextManeuver.step.maneuver.instruction;

    // Önce manuel İstbam kavşak veritabanında eşleşme ara (en doğru veri)
    const manual = matchManualJunction(mlng, mlat);
    if (manual) {
      const j: Junction = {
        id: `manual-${manual.id}`,
        name: manual.name,
        approach: manual.approach,
        lng: manual.lng,
        lat: manual.lat,
        warnMeters: manual.warnMeters,
        lanes: [],
        manualLanes: manual.lanes,
        trap: manual.trap,
      };
      return { j, distanceM: nextManeuver.distM };
    }

    // Eşleşme yoksa OSRM step'inden sentetik kavşak (LaneCard OSM Overpass'a sorar)
    const synthetic: Junction = {
      id: `route-step-${mlng.toFixed(4)},${mlat.toFixed(4)}`,
      name: roadName,
      approach: `${nextManeuver.step.maneuver.instruction} — rotanda`,
      lng: mlng,
      lat: mlat,
      warnMeters: 300,
      lanes: [],
    };
    return { j: synthetic, distanceM: nextManeuver.distM };
  }, [
    nextManeuver?.step.maneuver.location[0],
    nextManeuver?.step.maneuver.location[1],
    nextManeuver?.distM,
  ]);

  // Top bar 🗺 → trafik haritası
  // İsparkCard "Tümünü haritada gör" → ispark haritası (openMapForIspark veya
  // boş id ile aynı modal)
  function openMapAll() {
    setTrafficMapOpen(true);
  }

  function openIsparkMap() {
    setMapTitle(
      live
        ? "Konumun çevresi"
        : destination
        ? `${destination.label} çevresi`
        : "İSPARK Konumları"
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
      openMapAll: openIsparkMap,
      openMapForIspark,
      navigating: !!destination,
      route,
      routeLoading,
      routeError,
      nextManeuver,
      upcomingDecisions,
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
      routeLoading,
      routeError,
      nextManeuver,
      upcomingDecisions,
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

        <TrafficMapOverlay
          open={trafficMapOpen}
          onClose={() => setTrafficMapOpen(false)}
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
  live,
  geoError,
  onOpenMap,
  onMenu,
}: {
  destination: Destination | null;
  setDestination: (d: Destination | null) => void;
  query: string;
  setQuery: (q: string) => void;
  live: LiveLocation | null;
  geoError: string | null;
  onOpenMap: () => void;
  onMenu: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState<GeoHit[]>([]);
  const [searching, setSearching] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  // Click-outside ile dropdown'u kapat (mobil blur yarışı sorunu çözüldü)
  useEffect(() => {
    if (!open) return;
    function onDocPointer(e: PointerEvent) {
      const el = searchBoxRef.current;
      if (el && !el.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onDocPointer);
    return () => document.removeEventListener("pointerdown", onDocPointer);
  }, [open]);

  // Query 2+ karakter veya input aktifse dropdown açık olsun
  const dropdownOpen = open || query.trim().length >= 2;

  // Popüler yerler — anında filtre (debounce yok)
  const popularMatches = useMemo(() => searchPopular(query, 8), [query]);

  // Nominatim debounced arama (popüler az ya da hiç eşleşmediğinde değerli)
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const id = setTimeout(() => {
      setSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((d) => {
          setHits(d.items ?? []);
          setSearching(false);
        })
        .catch(() => setSearching(false));
    }, 350);
    return () => clearTimeout(id);
  }, [query]);

  function pickPopular(p: PopularPlace) {
    setDestination({ label: p.label, lng: p.lng, lat: p.lat });
    setQuery("");
    setOpen(false);
  }

  function pickHit(h: GeoHit) {
    setDestination({ label: h.label, lng: h.lng, lat: h.lat });
    setQuery("");
    setOpen(false);
  }

  function submitSearch() {
    // 1. Popüler eşleşmesi varsa onu seç (en hızlı)
    if (popularMatches.length > 0) {
      pickPopular(popularMatches[0]);
      return;
    }
    // 2. Nominatim sonuçları varsa ilkini seç
    if (hits.length > 0) {
      pickHit(hits[0]);
      return;
    }
    // 3. Henüz sonuç yok ama 2+ karakter var — beklemeden hemen ara
    const q = query.trim();
    if (q.length < 2) return;
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => {
        const items: GeoHit[] = d.items ?? [];
        setHits(items);
        if (items.length > 0) pickHit(items[0]);
        setSearching(false);
      })
      .catch(() => setSearching(false));
  }

  return (
    <header className="bg-bogaz-deep text-sis px-4 py-3 shadow-md shrink-0 relative z-50">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onMenu}
          className="size-9 rounded-full hover:bg-sis/10 text-sis transition flex items-center justify-center shrink-0"
          aria-label="Bölüm menüsü"
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

        <div ref={searchBoxRef} className="relative flex-1 max-w-xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
            className="flex items-center gap-2 bg-sis/8 hover:bg-sis/12 transition rounded-full pl-4 pr-1 py-1 ring-1 ring-sis/15"
          >
            <span className="text-vapur text-sm">→</span>
            <input
              type="text"
              value={query || destination?.label || ""}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Ara: Kadıköy, Üsküdar, Bağdat Cd…"
              enterKeyHint="search"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-sis/50 min-w-0"
            />
            {searching && (
              <span className="text-[10px] text-sis/50 shrink-0 hidden sm:inline">
                aranıyor…
              </span>
            )}
            {destination && !query && (
              <button
                type="button"
                onClick={() => {
                  setDestination(null);
                  setQuery("");
                }}
                className="text-xs text-sis/60 hover:text-vapur transition shrink-0 px-1.5"
                aria-label="Hedefi temizle"
              >
                ×
              </button>
            )}
            <button
              type="submit"
              disabled={query.trim().length < 2}
              className="shrink-0 rounded-full bg-vapur text-bogaz-deep font-bold text-xs px-3 py-1.5 hover:bg-vapur-soft transition disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Ara"
            >
              <span className="sm:hidden">🔍</span>
              <span className="hidden sm:inline">🔍 Ara</span>
            </button>
          </form>

          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card text-on rounded-card ring-1 ring-line shadow-xl shadow-bogaz-deep/20 max-h-96 overflow-y-auto z-30">
              {/* Popüler yerler önce */}
              {popularMatches.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-cini font-bold bg-cini/8 border-b border-line">
                    Popüler
                  </div>
                  {popularMatches.map((p) => (
                    <button
                      key={`p-${p.label}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickPopular(p);
                      }}
                      onTouchStart={(e) => {
                        // iOS Safari'de delayed click sorununu önle
                        e.preventDefault();
                        pickPopular(p);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-chip transition flex items-center justify-between border-b border-line last:border-0"
                    >
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="text-base">{kindEmoji(p.kind)}</span>
                        <span className="text-sm font-semibold text-on truncate">
                          {p.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-on-mute uppercase tracking-wider shrink-0 ml-2">
                        {p.kind === "ilce"
                          ? "İlçe"
                          : p.kind === "mahalle"
                          ? "Mahalle"
                          : p.kind === "ulasim"
                          ? "Ulaşım"
                          : "Yer"}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {/* Nominatim sonuçları sonra */}
              {hits.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-on-mute font-bold bg-chip/50 border-b border-line">
                    Adres ara
                  </div>
                  {hits.map((h) => (
                    <button
                      key={h.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickHit(h);
                      }}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        pickHit(h);
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-chip transition flex items-center justify-between border-b border-line last:border-0"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-on truncate">
                          {h.label}
                        </div>
                        {h.detail && (
                          <div className="text-[10px] text-on-mute truncate">
                            {h.detail}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] text-on-mute uppercase tracking-wider shrink-0 ml-2">
                        {h.type}
                      </span>
                    </button>
                  ))}
                </>
              )}

              {popularMatches.length === 0 &&
                hits.length === 0 &&
                query.length >= 2 &&
                !searching && (
                  <div className="px-4 py-4 text-sm text-on-mute">
                    Sonuç yok — başka bir kelime dene.
                  </div>
                )}

              {query.length < 2 && popularMatches.length === 0 && (
                <div className="px-4 py-4 text-sm text-on-mute">
                  2 karakterden başla — Kadıköy, Üsküdar, FSM…
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onOpenMap}
          className="inline-flex items-center justify-center rounded-full bg-vapur text-bogaz-deep font-semibold text-xs size-9 sm:size-auto sm:px-3 sm:py-1.5 hover:bg-vapur-soft transition shrink-0"
          aria-label="Trafik haritası"
        >
          <span>🗺</span>
          <span className="hidden sm:inline ml-1.5">Harita</span>
        </button>

        <div className="hidden md:flex items-center gap-2">
          <VoiceNavigation />
          <ThemeToggle variant="light-bar" />
        </div>
      </div>
    </header>
  );
}

function kindEmoji(k: PopularPlace["kind"]) {
  switch (k) {
    case "ilce":
      return "🏙";
    case "mahalle":
      return "📍";
    case "ulasim":
      return "🚉";
    case "landmark":
      return "🏛";
  }
}
