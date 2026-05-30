"use client";

import { createContext, useContext } from "react";
import type { IsparkLive } from "@/lib/ispark-source";
import type { Route as OsrmRoute, RouteStep } from "@/lib/route-source";

// "Sentetik" kavşak — OSRM rotasındaki sıradaki karar noktasından oluşturulur.
// Şerit rehberi bu noktanın lat/lng'sini OSM Overpass'a sorup turn:lanes alır.
// Manuel hazırlanmış şerit yapısı — OSM'de turn:lanes olmayan kritik
// İstanbul kavşakları için (kendi veritabanımızdan)
export type LaneHint = {
  no: number;
  arrow: string;
  destinations: string[];
};

export type Junction = {
  id: string;
  name: string;
  approach: string;
  lng: number;
  lat: number;
  warnMeters: number;
  lanes: never[]; // OSM Overpass'tan doldurulur
  // Manuel veritabanından eşleşen kavşak varsa şeritleri burada
  manualLanes?: LaneHint[];
  trap?: string;
};

export type LiveLocation = {
  lng: number;
  lat: number;
  accuracy: number;
  source: "gps" | "demo";
};

export type Destination = {
  label: string;
  lng: number;
  lat: number;
};

export type NextManeuver = {
  step: RouteStep;
  distM: number;
};

// "Karar" gerektiren manevra tipleri — şerit yönlendirmesi için anlamlı
export const DECISION_TYPES = new Set([
  "turn",
  "fork",
  "on ramp",
  "off ramp",
  "merge",
  "roundabout",
  "rotary",
  "exit roundabout",
  "exit rotary",
  "end of road",
  "arrive",
]);

export type PanelState = {
  live: LiveLocation | null;
  geoError: string | null;
  destination: Destination | null;
  setDestination: (d: Destination | null) => void;
  isparks: IsparkLive[];
  isparkLoading: boolean;
  activeJunction: { j: Junction; distanceM: number } | undefined;
  nearestIsparks: (IsparkLive & { distanceKm: number })[];
  openMapAll: () => void;
  openMapForIspark: (id: number) => void;
  navigating: boolean;
  route: OsrmRoute | null;
  routeLoading: boolean;
  routeError: string | null;
  nextManeuver: NextManeuver | null;
  upcomingDecisions: NextManeuver[];
};

export const PanelContext = createContext<PanelState | null>(null);

export function usePanel(): PanelState {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanel must be used inside <PanelShell>");
  }
  return ctx;
}
