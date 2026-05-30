"use client";

import { useEffect, useState } from "react";
import { usePanel } from "../PanelContext";
import { fmtDuration, fmtDistance } from "@/lib/route-source";
import { trafficStatusTr } from "@/lib/traffic-source";

export function RouteTrafficCard() {
  const { route } = usePanel();
  const [cityIndex, setCityIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    const tick = () => {
      fetch("/api/traffic")
        .then((r) => r.json())
        .then((d) => {
          if (!alive) return;
          if (d.source === "ibb") setCityIndex(d.current.index);
        })
        .catch(() => {});
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!route || cityIndex == null) return null;

  // Free flow time vs trafiğe göre tahmini
  const freeFlowS = route.duration;
  // 0-100 endeks → çarpan 1.0 - 2.0 arasında (kabaca lineer)
  const multiplier = 1 + (cityIndex / 100) * 1.0;
  const trafficS = Math.round(freeFlowS * multiplier);
  const deltaMin = Math.round((trafficS - freeFlowS) / 60);

  const status = trafficStatusTr(cityIndex);
  const tone = status.tone;
  const accent = {
    good: "text-cini",
    warn: "text-vapur",
    bad: "text-vapur-red",
  }[tone];
  const bgRing = {
    good: "ring-cini/35",
    warn: "ring-vapur/40",
    bad: "ring-vapur-red/40",
  }[tone];

  return (
    <section
      className={`rounded-2xl bg-bogaz-deep text-sis ring-1 ${bgRing} shadow-md shadow-bogaz-deep/30 overflow-hidden`}
    >
      <div className="px-4 pt-3 pb-3 flex items-start justify-between gap-3">
        <div>
          <div className={`text-[10px] uppercase tracking-widest ${accent} font-bold`}>
            Rotanda trafik
          </div>
          <div className="font-display text-base font-semibold text-sis leading-tight mt-1">
            Şehir endeksi {cityIndex}/100 · {status.label}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-sis/55 uppercase tracking-wider">
            Tahmini varış
          </div>
          <div className={`font-display text-2xl font-semibold ${accent} tabular-nums leading-none mt-0.5`}>
            {fmtDuration(trafficS)}
          </div>
        </div>
      </div>

      <div className="bg-bogaz/60 px-4 py-2 grid grid-cols-3 gap-2 text-[11px]">
        <div>
          <div className="text-sis/55 text-[10px] uppercase tracking-wider">Akıcı</div>
          <div className="text-sis font-semibold font-mono">{fmtDuration(freeFlowS)}</div>
        </div>
        <div>
          <div className="text-sis/55 text-[10px] uppercase tracking-wider">Trafik etkisi</div>
          <div className={`font-semibold font-mono ${accent}`}>
            {deltaMin > 0 ? `+${deltaMin} dk` : `${deltaMin} dk`}
          </div>
        </div>
        <div>
          <div className="text-sis/55 text-[10px] uppercase tracking-wider">Mesafe</div>
          <div className="text-sis font-semibold font-mono">{fmtDistance(route.distance)}</div>
        </div>
      </div>
    </section>
  );
}
