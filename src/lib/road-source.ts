// Yakındaki yolun hız limiti + civardaki hız kameraları — OSM Overpass.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

type RawEl = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

async function overpass(query: string): Promise<{ elements: RawEl[] }> {
  let lastErr: unknown;
  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
          "User-Agent": "istbam/0.1 (hello@istbam.app)",
        },
        body: "data=" + encodeURIComponent(query),
        next: { revalidate: 300, tags: ["overpass-road"] },
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
  throw lastErr ?? new Error("Overpass başarısız");
}

export type RoadInfo = {
  maxSpeedKmh?: number;
  roadName?: string;
  roadRef?: string;
  highway?: string;
};

export type SpeedCamera = {
  id: string;
  lng: number;
  lat: number;
  maxspeed?: number;
};

export async function fetchNearestRoadAndCameras(
  lat: number,
  lng: number
): Promise<{ road: RoadInfo | null; cameras: SpeedCamera[] }> {
  const HIGHWAY = "^(motorway|trunk|primary|secondary|tertiary|residential|unclassified|motorway_link|trunk_link|primary_link)$";

  const query = `
    [out:json][timeout:15];
    (
      way(around:60,${lat},${lng})[highway~"${HIGHWAY}"];
      node(around:1500,${lat},${lng})[highway=speed_camera];
      node(around:1500,${lat},${lng})["maxspeed:type"~"camera"];
    );
    out tags center 50;
  `.trim();

  try {
    const data = await overpass(query);

    // En iyi yol: en çok lanes + highway öncelik
    const ways = data.elements.filter((e) => e.type === "way");
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
      residential: 1,
    };

    let bestRoad: RoadInfo | null = null;
    let bestScore = -1;
    for (const w of ways) {
      const t = w.tags ?? {};
      const score = priority[t.highway ?? ""] ?? 0;
      if (score > bestScore) {
        bestScore = score;
        bestRoad = {
          maxSpeedKmh: parseMaxSpeed(t.maxspeed),
          roadName: t.name,
          roadRef: t.ref,
          highway: t.highway,
        };
      }
    }

    // Kameralar
    const cameras: SpeedCamera[] = data.elements
      .filter(
        (e) =>
          e.type === "node" &&
          (e.tags?.highway === "speed_camera" ||
            (e.tags?.["maxspeed:type"] ?? "").includes("camera"))
      )
      .map((e) => ({
        id: `n${e.id}`,
        lat: e.lat!,
        lng: e.lon!,
        maxspeed: parseMaxSpeed(e.tags?.maxspeed),
      }))
      .filter((c) => Number.isFinite(c.lat) && Number.isFinite(c.lng));

    return { road: bestRoad, cameras };
  } catch {
    return { road: null, cameras: [] };
  }
}

function parseMaxSpeed(raw?: string): number | undefined {
  if (!raw) return undefined;
  // "50", "50 mph", "TR:urban", "walk" gibi değerler olabilir
  const m = raw.match(/(\d+)/);
  if (!m) return undefined;
  let v = parseInt(m[1], 10);
  if (raw.toLowerCase().includes("mph")) v = Math.round(v * 1.60934);
  return v;
}
