// OpenStreetMap Overpass API ile şerit (lanes / turn:lanes) sorgulama.
// Cache: Next fetch revalidate, böylece aynı kavşak için tekrar istek atılmaz.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const HIGHWAY_RE =
  "^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|motorway_link|trunk_link|primary_link|secondary_link|tertiary_link)$";

export type OsmTurn =
  | "left"
  | "slight_left"
  | "through"
  | "slight_right"
  | "right"
  | "sharp_left"
  | "sharp_right"
  | "merge_to_left"
  | "merge_to_right"
  | "reverse"
  | "none";

export type OsmLane = {
  no: number;
  turn: OsmTurn;
  destination?: string; // destination:lanes'ten gelir
  ref?: string; // destination:ref:lanes (örn. O-1, D-100)
};

export type OsmLanesResult = {
  source: "osm";
  roadName?: string;
  roadRef?: string;
  oneway?: boolean;
  lanes: OsmLane[];
  rawLaneCount?: number; // turn:lanes yoksa sadece sayı
  osmWayId: number;
  fetchedAt: number;
};

export type OsmLanesEmpty = {
  source: "empty";
  reason: string;
};

type Tags = Record<string, string>;
type OverpassWay = { type: "way"; id: number; tags: Tags };

async function overpassFetch(query: string): Promise<{ elements: OverpassWay[] }> {
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "istbam/0.1 (https://istbam.app contact: hello@istbam.app)",
        },
        body: "data=" + encodeURIComponent(query),
        next: { revalidate: 3600, tags: ["overpass"] },
      });
      if (!res.ok) {
        lastErr = new Error(`${url} → HTTP ${res.status}`);
        continue;
      }
      return await res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("Tüm Overpass uçları başarısız");
}

export async function fetchOsmLanes(
  lat: number,
  lng: number,
  radiusMeters = 150
): Promise<OsmLanesResult | OsmLanesEmpty> {
  const query = `
    [out:json][timeout:20];
    way(around:${radiusMeters},${lat},${lng})
      [highway~"${HIGHWAY_RE}"];
    out tags 12;
  `.trim();

  let json: { elements: OverpassWay[] };
  try {
    json = await overpassFetch(query);
  } catch (e) {
    return { source: "empty", reason: `Overpass: ${(e as Error).message}` };
  }

  if (!json.elements?.length) {
    return { source: "empty", reason: "Civarda uygun yol yok" };
  }

  // En zengin veriye sahip way'i seç:
  // 1) turn:lanes var mı?
  // 2) lanes sayısı yüksek mi?
  // 3) highway öncelik sırası
  const priority: Record<string, number> = {
    motorway: 7,
    trunk: 6,
    primary: 5,
    motorway_link: 5,
    trunk_link: 4,
    secondary: 4,
    primary_link: 3,
    tertiary: 2,
    secondary_link: 2,
    tertiary_link: 1,
  };

  const scored = json.elements
    .filter((el) => el.tags?.highway)
    .map((el) => {
      const t = el.tags;
      const hasTurnLanes = !!(t["turn:lanes"] || t["turn:lanes:forward"] || t["turn:lanes:backward"]);
      const lanesCount = parseInt(t.lanes ?? "0", 10) || 0;
      const hwy = priority[t.highway] ?? 0;
      return {
        el,
        score: (hasTurnLanes ? 100 : 0) + lanesCount * 2 + hwy,
      };
    })
    .sort((a, b) => b.score - a.score);

  const top = scored[0]?.el;
  if (!top) return { source: "empty", reason: "Skor pozitif way yok" };

  const tags = top.tags;
  const oneway = tags.oneway === "yes";

  // turn:lanes hangi yön
  const turnLanesRaw =
    tags["turn:lanes"] ||
    tags["turn:lanes:forward"] ||
    tags["turn:lanes:backward"] ||
    "";

  const destLanesRaw =
    tags["destination:lanes"] ||
    tags["destination:lanes:forward"] ||
    tags["destination:lanes:backward"] ||
    "";
  const destRefLanesRaw =
    tags["destination:ref:lanes"] ||
    tags["destination:ref:lanes:forward"] ||
    tags["destination:ref:lanes:backward"] ||
    "";

  if (!turnLanesRaw) {
    // turn:lanes yoksa yalnız sayı dön
    const count = parseInt(tags.lanes ?? "0", 10) || 0;
    if (count < 2) {
      return { source: "empty", reason: "Şerit verisi eksik" };
    }
    return {
      source: "osm",
      roadName: tags.name,
      roadRef: tags.ref,
      oneway,
      lanes: Array.from({ length: count }, (_, i) => ({
        no: i + 1,
        turn: "through" as OsmTurn,
      })),
      rawLaneCount: count,
      osmWayId: top.id,
      fetchedAt: Date.now(),
    };
  }

  const turnParts = turnLanesRaw.split("|");
  const destParts = destLanesRaw.split("|");
  const refParts = destRefLanesRaw.split("|");

  const lanes: OsmLane[] = turnParts.map((raw, i) => {
    // bir şeritte birden fazla yön olabilir (örn. "through;right"). İlkini al.
    const turn = (raw.split(";")[0].trim() || "none") as OsmTurn;
    const destination = (destParts[i] ?? "").replace(/;/g, " · ").trim() || undefined;
    const ref = (refParts[i] ?? "").replace(/;/g, " · ").trim() || undefined;
    return {
      no: i + 1,
      turn,
      destination,
      ref,
    };
  });

  return {
    source: "osm",
    roadName: tags.name,
    roadRef: tags.ref,
    oneway,
    lanes,
    osmWayId: top.id,
    fetchedAt: Date.now(),
  };
}

// OSM turn → Türkçe etiket
export function turnLabelTr(t: OsmTurn): string {
  switch (t) {
    case "left":
      return "Sola dön";
    case "slight_left":
      return "Sola hafif";
    case "through":
      return "Düz devam";
    case "slight_right":
      return "Sağa hafif";
    case "right":
      return "Sağa dön";
    case "sharp_left":
      return "Keskin sol";
    case "sharp_right":
      return "Keskin sağ";
    case "merge_to_left":
      return "Sola katıl";
    case "merge_to_right":
      return "Sağa katıl";
    case "reverse":
      return "U dönüş";
    case "none":
    default:
      return "—";
  }
}

// Görsel için ok karakteri
export function turnArrow(t: OsmTurn): string {
  switch (t) {
    case "left":
      return "←";
    case "slight_left":
      return "↖";
    case "through":
      return "↑";
    case "slight_right":
      return "↗";
    case "right":
      return "→";
    case "sharp_left":
      return "⤺";
    case "sharp_right":
      return "⤻";
    case "merge_to_left":
      return "↰";
    case "merge_to_right":
      return "↱";
    case "reverse":
      return "↩";
    case "none":
    default:
      return "·";
  }
}
