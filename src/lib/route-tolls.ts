// OSRM rotasındaki step.name değerlerini HGS_TARIFF'le eşleyip
// rotada geçilecek köprü/otoyol toplamını hesaplar.

import { HGS_TARIFF, type HgsToll } from "@/data/hgs";
import type { Route as OsrmRoute } from "./route-source";

const KEYWORDS: Record<string, string[]> = {
  "kopru-15temmuz": ["15 temmuz", "boğaziçi köprü", "şehitler köprü"],
  "kopru-fsm": ["fatih sultan mehmet", "fsm", "ikinci köprü"],
  "kopru-yss": ["yavuz sultan selim", "yss", "üçüncü köprü"],
  "kopru-osmangazi": ["osmangazi köprü"],
  "kopru-canakkale": ["1915 çanakkale", "çanakkale köprü"],
  "tunel-avrasya": ["avrasya tüneli", "avrasya tunel"],
  "otoyol-tem-istanbul-ankara": ["tem", "o-4 ankara", "anadolu otoyolu"],
  "otoyol-o7-kuzeymarmara": ["o-7", "kuzey marmara"],
  "otoyol-o5-istanbul-izmir": ["o-5", "izmir otoyol", "gebze-izmir"],
  "otoyol-o4-tem-anadolu": ["o-4 edirne", "trakya otoyol"],
};

export type RouteToll = {
  toll: HgsToll;
  // Bu kalemin rotada görülme sayısı (genelde 1)
  count: number;
};

export function computeRouteTolls(route: OsrmRoute): {
  items: RouteToll[];
  total: number;
} {
  // Step name'leri normalize edip birleştir
  const stepText = route.steps
    .map((s) => (s.name || "") + " " + (s.maneuver.instruction || ""))
    .join(" | ")
    .toLocaleLowerCase("tr");

  const seen = new Map<string, number>();
  for (const [tollId, keywords] of Object.entries(KEYWORDS)) {
    let matches = 0;
    for (const kw of keywords) {
      if (stepText.includes(kw)) {
        matches++;
      }
    }
    if (matches > 0) seen.set(tollId, 1); // her ücreti bir kez say
  }

  const items: RouteToll[] = [];
  let total = 0;
  for (const [tollId, count] of seen) {
    const toll = HGS_TARIFF.tolls.find((t) => t.id === tollId);
    if (!toll) continue;
    items.push({ toll, count });
    total += toll.class1Tl * count;
  }

  return { items, total };
}
