"use client";

import { fmtDistance, fmtDuration } from "@/lib/route-source";

type Props = {
  arrow: string;
  instruction: string;
  distanceM: number;
  totalDistanceM: number;
  totalDurationS: number;
};

export function NextManeuverCard({
  arrow,
  instruction,
  distanceM,
  totalDistanceM,
  totalDurationS,
}: Props) {
  // Yakınlık tonu: yaklaştıkça vapur, uzaktayken cini
  const urgent = distanceM < 200;
  const close = distanceM < 1000;
  const tone = urgent ? "vapur-red" : close ? "vapur" : "cini";
  const ring = {
    "vapur-red": "ring-vapur-red/50 shadow-vapur-red/20",
    vapur: "ring-vapur/40 shadow-vapur/15",
    cini: "ring-cini/35 shadow-cini/10",
  }[tone];
  const fg = {
    "vapur-red": "text-vapur-red",
    vapur: "text-vapur",
    cini: "text-cini",
  }[tone];
  const bgArrow = {
    "vapur-red": "bg-vapur-red text-sis",
    vapur: "bg-vapur text-bogaz-deep",
    cini: "bg-cini text-bogaz-deep",
  }[tone];

  return (
    <section
      className={`rounded-2xl bg-bogaz-deep text-sis ring-1 ${ring} shadow-xl overflow-hidden`}
    >
      <div className="px-5 py-4 flex items-center gap-4">
        <div
          className={`size-16 rounded-2xl ${bgArrow} flex items-center justify-center text-3xl shrink-0 shadow-md shadow-bogaz-deep/40`}
        >
          {arrow}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`text-[10px] uppercase tracking-widest ${fg} font-bold`}>
            Sıradaki manevra
          </div>
          <div className={`font-display text-3xl font-semibold ${fg} leading-none mt-1 tabular-nums`}>
            {fmtDistance(distanceM)}
          </div>
          <div className="text-sm text-sis/90 mt-2 leading-tight truncate">
            {instruction}
          </div>
        </div>
      </div>
      <div className="bg-bogaz-deep/60 px-5 py-2 flex items-center justify-between text-[11px]">
        <span className="text-sis/65">Hedefe kalan</span>
        <span className="font-semibold text-vapur">
          {fmtDistance(totalDistanceM)} · {fmtDuration(totalDurationS)}
        </span>
      </div>
    </section>
  );
}
