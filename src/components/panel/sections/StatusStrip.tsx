"use client";

import { useEffect, useState } from "react";
import { usePanel } from "../PanelContext";
import { trafficStatusTr, type TrafficSnapshot } from "@/lib/traffic-source";

type Traffic = TrafficSnapshot | null;

export function StatusStrip() {
  const { live, isparks, activeJunction, destination, geoError } = usePanel();
  const [traffic, setTraffic] = useState<Traffic>(null);
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let alive = true;
    const fetchT = () =>
      fetch("/api/traffic")
        .then((r) => r.json())
        .then((d) => alive && d.source === "ibb" && setTraffic(d))
        .catch(() => {});
    fetchT();
    const id = setInterval(fetchT, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const items: {
    lbl: string;
    val: string;
    color: string;
    icon: string;
  }[] = [];

  // 1. Trafik
  if (traffic) {
    const st = trafficStatusTr(traffic.current.index);
    items.push({
      lbl: "Trafik",
      val: `${traffic.current.index}`,
      color:
        st.tone === "good"
          ? "text-cini"
          : st.tone === "warn"
          ? "text-vapur"
          : "text-vapur-red",
      icon: "🚦",
    });
  }

  // 2. Konum
  items.push({
    lbl: "Konum",
    val: live
      ? `±${Math.round(live.accuracy)}m`
      : geoError
      ? "Kapalı"
      : "...",
    color: live ? "text-cini" : geoError ? "text-vapur-red" : "text-on-mute",
    icon: "📍",
  });

  // 3. İSPARK
  items.push({
    lbl: "İSPARK",
    val: isparks.length ? `${isparks.length}` : "...",
    color: "text-on",
    icon: "🅿",
  });

  // 4. Şu an
  items.push({
    lbl: "Saat",
    val: time || "—",
    color: "text-on",
    icon: "🕒",
  });

  return (
    <div className="animate-fade-in-up rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-line">
        {items.map((x) => (
          <div
            key={x.lbl}
            className="px-3 py-2.5 flex items-center gap-2.5"
          >
            <span className="text-lg leading-none shrink-0">{x.icon}</span>
            <div className="min-w-0">
              <div className="text-[9px] uppercase tracking-widest text-on-mute font-bold leading-none">
                {x.lbl}
              </div>
              <div
                className={`text-sm font-semibold ${x.color} mt-0.5 leading-none truncate`}
              >
                {x.val}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Aktif yönlendirme bandı */}
      {destination && (
        <div className="bg-vapur text-bogaz-deep text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 flex items-center gap-2">
          <span className="inline-block size-1.5 rounded-full bg-bogaz-deep animate-pulse" />
          Yönlendirme: {destination.label}
          {activeJunction && (
            <span className="ml-auto font-mono text-bogaz-deep/80">
              {activeJunction.distanceM} m
            </span>
          )}
        </div>
      )}
    </div>
  );
}
