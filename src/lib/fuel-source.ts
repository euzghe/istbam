// Akaryakıt — iki tür veri:
// 1) İstasyon konumları: OpenStreetMap Overpass (canlı, gerçek)
//    `node|way[amenity=fuel]` → marka, isim, koordinat
// 2) Günlük fiyatlar: Türkiye'de açık API yok. Brand resmi sayfaları
//    günlük yayımlıyor. Bu yüzden "bugünkü referans" değerleri
//    elle güncellenen bir liste — kart, kullanıcıyı dürüstçe işaretliyor
//    ve resmi sayfa linklerini sunuyor.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export type FuelStation = {
  id: string;
  name?: string;
  brand?: string;
  lng: number;
  lat: number;
  osmType: "node" | "way";
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
        next: { revalidate: 3600, tags: ["overpass-fuel"] },
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

type RawEl = {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

export async function fetchFuelStations(
  lat: number,
  lng: number,
  radiusMeters = 1500
): Promise<FuelStation[]> {
  const query = `
    [out:json][timeout:20];
    (
      node(around:${radiusMeters},${lat},${lng})[amenity=fuel];
      way(around:${radiusMeters},${lat},${lng})[amenity=fuel];
    );
    out tags center 200;
  `.trim();

  const data = await overpass(query);
  return data.elements
    .map((el) => {
      const tags = el.tags ?? {};
      const co =
        el.type === "node"
          ? { lat: el.lat!, lng: el.lon! }
          : { lat: el.center!.lat, lng: el.center!.lon };
      if (!Number.isFinite(co.lat) || !Number.isFinite(co.lng)) return null;
      return {
        id: `${el.type[0]}${el.id}`,
        name: tags.name,
        brand: tags.brand,
        lng: co.lng,
        lat: co.lat,
        osmType: el.type,
      } as FuelStation;
    })
    .filter((x): x is FuelStation => x !== null);
}

// Marka için resmi günlük fiyat sayfaları (kullanıcı tek tıkla bakar).
// Tek bir markadan API gelmediği için snapshot değil — tek source-of-truth burası.
export const BRAND_OFFICIAL: Record<string, string> = {
  Shell: "https://www.shell.com.tr/motorists/shell-fuels/fuel-prices.html",
  Opet: "https://www.opet.com.tr/akaryakit-fiyatlari",
  "Petrol Ofisi": "https://www.petrolofisi.com.tr/akaryakit-fiyatlari",
  BP: "https://www.bp.com/tr_tr/turkey/home/products-services/akaryakit/akaryakit-fiyatlari.html",
  Total: "https://www.totalenergies.com.tr/tr/perakende-fiyatlar",
  Aytemiz: "https://www.aytemiz.com.tr/akaryakit-fiyatlari",
};

// Brand normalize — OSM'de marka adları farklı yazılabiliyor
export function normalizeBrand(raw?: string): string | undefined {
  if (!raw) return undefined;
  const r = raw.toLocaleLowerCase("tr").trim();
  if (r.includes("shell")) return "Shell";
  if (r.includes("opet")) return "Opet";
  if (r.includes("petrol ofisi") || r === "po") return "Petrol Ofisi";
  if (r.includes("bp")) return "BP";
  if (r.includes("total")) return "Total";
  if (r.includes("aytemiz")) return "Aytemiz";
  if (r.includes("lukoil") || r.includes("teboil")) return "Lukoil";
  if (r.includes("aytek") || r.includes("kadooğlu")) return "Aytek";
  return raw[0].toUpperCase() + raw.slice(1);
}

// Bugünkü İstanbul akaryakıt fiyat REFERANSI.
// Açık API yok — bu rakamlar manuel kontrol edilip güncellenmeli.
// Son güncelleme tarihini de tutuyoruz ki kullanıcı eski olduğunu görsün.
// Kaynak: EPDK günlük tavsiye + brand resmi sayfaları ortalaması.
export const FUEL_PRICE_REFERENCE = {
  updatedAt: "2026-05-29",
  city: "İstanbul",
  source: "EPDK + marka resmi sayfaları ortalaması",
  sourceUrl: "https://www.epdk.gov.tr/Detay/Icerik/3-0-0-91/akaryakit",
  prices: {
    benzin95: 52.1,
    motorin: 54.3,
    lpg: 28.7,
  },
};

export type FuelPriceReference = typeof FUEL_PRICE_REFERENCE;
