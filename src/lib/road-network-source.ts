// İstanbul ana yol ağı (motorway + trunk) — OSM Overpass'tan çekilir.
// GeoJSON FeatureCollection olarak döner, sadece koordinat + class taşınır.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

const ISTANBUL_BBOX = "40.80,28.50,41.30,29.55";

type OverpassWay = {
  type: "way";
  id: number;
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
};

export type RoadFeature = {
  type: "Feature";
  properties: { cls: "motorway" | "trunk" };
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

export type RoadNetwork = {
  type: "FeatureCollection";
  features: RoadFeature[];
  fetchedAt: number;
};

async function overpass(query: string): Promise<{ elements: OverpassWay[] }> {
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
        next: { revalidate: 86400, tags: ["road-network"] },
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

export async function fetchRoadNetwork(): Promise<RoadNetwork> {
  const query = `
    [out:json][timeout:60];
    (
      way[highway=motorway](${ISTANBUL_BBOX});
      way[highway=trunk](${ISTANBUL_BBOX});
    );
    out geom 5000;
  `.trim();

  const data = await overpass(query);

  const features: RoadFeature[] = data.elements
    .filter((el) => el.type === "way" && Array.isArray(el.geometry) && el.geometry.length > 1)
    .map((w) => {
      const cls = (w.tags?.highway === "motorway" ? "motorway" : "trunk") as
        | "motorway"
        | "trunk";
      return {
        type: "Feature",
        properties: { cls },
        geometry: {
          type: "LineString",
          coordinates: w.geometry!.map((p) => [
            // 5 ondalık (~1m hassasiyet) — boyut tasarrufu
            +p.lon.toFixed(5),
            +p.lat.toFixed(5),
          ]) as [number, number][],
        },
      } as RoadFeature;
    });

  return {
    type: "FeatureCollection",
    features,
    fetchedAt: Date.now(),
  };
}
