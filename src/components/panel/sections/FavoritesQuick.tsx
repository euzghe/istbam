"use client";

import { useEffect, useState } from "react";
import { usePanel } from "../PanelContext";
import {
  findByKind,
  loadFavorites,
  type Favorite,
} from "@/lib/favorites";

export function FavoritesQuick() {
  const { setDestination } = usePanel();
  const [favorites, setFavorites] = useState<Favorite[]>([]);

  useEffect(() => {
    setFavorites(loadFavorites());
    // localStorage diğer sekmeden güncellenirse senkron tut
    const onStorage = (e: StorageEvent) => {
      if (e.key === "istbam:favorites") setFavorites(loadFavorites());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const ev = findByKind(favorites, "ev");
  const is = findByKind(favorites, "is");
  const otherFav = favorites.filter((f) => f.kind === "ozel");

  function go(fav: Favorite) {
    setDestination({
      label: fav.label,
      lng: fav.lng,
      lat: fav.lat,
    });
  }

  if (favorites.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-card/70 backdrop-blur ring-1 ring-line shadow-sm p-3 flex flex-wrap gap-2">
      <span className="text-[10px] uppercase tracking-widest text-on-mute font-bold flex items-center self-center">
        Tek tıkla:
      </span>
      {ev && (
        <button
          onClick={() => go(ev)}
          className="inline-flex items-center gap-1.5 rounded-full bg-cini text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-cini-soft transition"
          title={`Ev: ${ev.label}`}
        >
          🏠 Ev
        </button>
      )}
      {is && (
        <button
          onClick={() => go(is)}
          className="inline-flex items-center gap-1.5 rounded-full bg-vapur text-bogaz-deep font-semibold text-xs px-3 py-1.5 hover:bg-vapur-soft transition"
          title={`İş: ${is.label}`}
        >
          💼 İş
        </button>
      )}
      {otherFav.slice(0, 4).map((f) => (
        <button
          key={f.id}
          onClick={() => go(f)}
          className="inline-flex items-center gap-1.5 rounded-full bg-card ring-1 ring-line text-on font-semibold text-xs px-3 py-1.5 hover:bg-chip transition"
          title={f.label}
        >
          {f.emoji ?? "⭐"} {f.label}
        </button>
      ))}
    </section>
  );
}
