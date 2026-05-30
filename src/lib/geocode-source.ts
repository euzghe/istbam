// Nominatim — OpenStreetMap'in açık geocoding servisi.
// Ücretsiz, anahtar gerekmez. Politika: User-Agent şart, 1 req/sec.

const NOMINATIM = "https://nominatim.openstreetmap.org";

export type GeoHit = {
  id: string;
  label: string;       // tek satır kullanıcıya gösterilecek
  detail: string;      // detaylı satır
  lng: number;
  lat: number;
  type: string;        // place/road/poi vb.
};

type Raw = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type?: string;
  class?: string;
  name?: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    district?: string;
    city?: string;
    state?: string;
    town?: string;
    village?: string;
    quarter?: string;
  };
};

export async function geocode(query: string): Promise<GeoHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  // İstanbul bbox bias (left, top, right, bottom — lon/lat sırası)
  const viewbox = "28.50,41.30,29.55,40.80";
  const url = `${NOMINATIM}/search?q=${encodeURIComponent(
    q
  )}&format=json&addressdetails=1&limit=8&viewbox=${viewbox}&bounded=0&countrycodes=tr&accept-language=tr`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "istbam/0.1 (hello@istbam.app)",
      },
      next: { revalidate: 600, tags: ["nominatim"] },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Raw[];
    return data
      .map((r) => normalize(r))
      .filter((x): x is GeoHit => x !== null);
  } catch {
    return [];
  }
}

function normalize(r: Raw): GeoHit | null {
  const lat = parseFloat(r.lat);
  const lng = parseFloat(r.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const a = r.address ?? {};
  // Kısa başlık: ada baskısı (name varsa o, yoksa road/suburb)
  const head = r.name || a.road || a.suburb || a.neighbourhood || r.display_name.split(",")[0];
  const district = a.district || a.suburb || a.city || a.town || a.village || "";
  const city = a.city || a.state || "İstanbul";

  return {
    id: `n${r.place_id}`,
    label: head,
    detail: [district, city].filter(Boolean).join(" · "),
    lng,
    lat,
    type: r.type ?? r.class ?? "place",
  };
}
