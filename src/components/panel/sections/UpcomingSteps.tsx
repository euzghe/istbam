"use client";

import { usePanel } from "../PanelContext";
import { fmtDistance } from "@/lib/route-source";

export function UpcomingSteps() {
  const { upcomingDecisions } = usePanel();
  // İlki NextManeuverCard'da büyük gösteriliyor — sonraki 2'yi listele
  const rest = upcomingDecisions.slice(1, 4);
  if (rest.length === 0) return null;

  return (
    <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm overflow-hidden">
      <div className="px-4 py-2 text-[10px] uppercase tracking-widest text-on-mute font-bold border-b border-line">
        Sonra…
      </div>
      <ul className="divide-y divide-line">
        {rest.map((d, i) => (
          <li
            key={`${d.step.maneuver.location[0]},${d.step.maneuver.location[1]},${i}`}
            className="px-4 py-2.5 flex items-center gap-3"
          >
            <div className="size-9 rounded-lg bg-chip flex items-center justify-center text-lg shrink-0">
              {d.step.maneuver.arrow}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-on leading-tight truncate">
                {d.step.maneuver.instruction}
              </div>
              {d.step.name && d.step.name !== d.step.maneuver.instruction && (
                <div className="text-[10px] text-on-mute truncate leading-tight mt-0.5">
                  {d.step.name}
                </div>
              )}
            </div>
            <div className="font-mono text-sm font-semibold text-on-soft shrink-0 tabular-nums">
              {fmtDistance(d.distM)}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
