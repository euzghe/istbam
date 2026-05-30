"use client";

// Kullanıcı favorileri — localStorage, sunucuya gitmez.
// İki sabit slot: ev, iş. Plus ek özel favoriler.

export type Favorite = {
  id: string;
  kind: "ev" | "is" | "ozel";
  label: string;
  lng: number;
  lat: number;
  emoji?: string;
  savedAt: number;
};

const STORE = "istbam:favorites";

export function loadFavorites(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORE);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as Favorite[];
  } catch {
    return [];
  }
}

export function saveFavorites(list: Favorite[]) {
  try {
    localStorage.setItem(STORE, JSON.stringify(list));
  } catch {}
}

export function addOrUpdate(fav: Favorite): Favorite[] {
  const list = loadFavorites();
  // Aynı kind=ev/iş tek olabilir; özel için id ile eşleştir
  let next: Favorite[];
  if (fav.kind === "ev" || fav.kind === "is") {
    next = list.filter((f) => f.kind !== fav.kind);
    next.push(fav);
  } else {
    const idx = list.findIndex((f) => f.id === fav.id);
    next = [...list];
    if (idx >= 0) next[idx] = fav;
    else next.push(fav);
  }
  saveFavorites(next);
  return next;
}

export function remove(id: string): Favorite[] {
  const list = loadFavorites().filter((f) => f.id !== id);
  saveFavorites(list);
  return list;
}

export function newId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function findByKind(
  list: Favorite[],
  kind: "ev" | "is"
): Favorite | undefined {
  return list.find((f) => f.kind === kind);
}
