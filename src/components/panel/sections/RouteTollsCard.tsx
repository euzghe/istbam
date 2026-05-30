"use client";

import { usePanel } from "../PanelContext";
import { computeRouteTolls } from "@/lib/route-tolls";

export function RouteTollsCard() {
  const { route } = usePanel();
  if (!route) return null;

  const { items, total } = computeRouteTolls(route);
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl bg-bogaz text-sis ring-1 ring-vapur/30 shadow-md shadow-bogaz-deep/30 overflow-hidden">
      <div className="px-4 pt-3 pb-2 flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-vapur font-bold">
            Rotada HGS
          </div>
          <div className="text-sm text-sis/70 mt-0.5">
            Bu güzergahta geçilecek ücretli noktalar
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-2xl font-semibold text-vapur tabular-nums leading-none">
            {total} <span className="text-sm text-sis/60 font-normal">₺</span>
          </div>
          <div className="text-[10px] text-sis/55 mt-0.5 uppercase tracking-wider">
            toplam
          </div>
        </div>
      </div>
      <ul className="divide-y divide-sis/10 px-4 pb-3">
        {items.map(({ toll, count }) => (
          <li
            key={toll.id}
            className="flex items-center justify-between py-1.5 text-xs"
          >
            <div className="min-w-0">
              <div className="font-semibold text-sis truncate">
                {toll.name}
              </div>
              <div className="text-[10px] text-sis/55 truncate">
                {toll.operator}
                {count > 1 ? ` · ×${count}` : ""}
              </div>
            </div>
            <div className="font-mono text-sis font-semibold shrink-0">
              {toll.class1Tl * count} ₺
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
