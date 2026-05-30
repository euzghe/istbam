"use client";

import { createContext, useContext } from "react";
import type { IsparkLive } from "@/lib/ispark-source";
import type { Junction } from "@/data/junctions";
import type { Route as OsrmRoute, RouteStep } from "@/lib/route-source";

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
  junctionId?: string;
};

export type NextManeuver = {
  step: RouteStep;
  distM: number;
};

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
  nextManeuver: NextManeuver | null;
};

export const PanelContext = createContext<PanelState | null>(null);

export function usePanel(): PanelState {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("usePanel must be used inside <PanelShell>");
  }
  return ctx;
}
