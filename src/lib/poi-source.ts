// OpenStreetMap üzerinden POI (hastane, eczane, AVM) sorgulama.
// Marker rengi ve kategori, her POI tipi için ayrı kurallar.

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export type PoiType =
  | "hastane"
  | "eczane"
  | "avm"
  | "sarj"
  | "yikama"
  | "taksi"
  | "cekici";

export type Poi = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  category: string;      // "Devlet", "Özel", "Üniversite", "Genel", ...
  categoryKey: string;   // tutarlı key — renk eşleme için
  address?: string;
  phone?: string;
  openHours?: string;
  website?: string;
  // Eczane için (manuel olarak doldurulamıyorsa undefined kalır)
  isOnDuty?: boolean;
};

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
        next: { revalidate: 3600, tags: ["overpass-poi"] },
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

// --- Hastane ---
function hospitalCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  const opType = (tags["operator:type"] || "").toLowerCase();
  const operator = (tags.operator || "").toLowerCase();
  const name = (tags.name || "").toLowerCase();

  if (
    opType === "government" ||
    opType === "public" ||
    operator.includes("devlet") ||
    operator.includes("sağlık bakanlığı") ||
    name.includes("devlet hastanesi") ||
    name.includes("eğitim ve araştırma")
  ) {
    return { category: "Devlet", categoryKey: "devlet" };
  }
  if (
    opType === "private" ||
    operator.includes("özel") ||
    name.includes("özel")
  ) {
    return { category: "Özel", categoryKey: "ozel" };
  }
  if (
    operator.includes("üniversite") ||
    name.includes("üniversitesi") ||
    operator.includes("university")
  ) {
    return { category: "Üniversite", categoryKey: "universite" };
  }
  return { category: "Hastane", categoryKey: "genel" };
}

// --- Eczane ---
function pharmacyCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
  isOnDuty?: boolean;
} {
  // OSM'de nöbetçi bilgisi standart olmadığı için undefined.
  // Daily/24h tagleri varsa "24 saat" işaretle.
  const opening = (tags.opening_hours || "").toLowerCase();
  if (opening === "24/7" || opening.includes("24/7")) {
    return { category: "24 saat açık", categoryKey: "h24", isOnDuty: true };
  }
  return { category: "Eczane", categoryKey: "normal" };
}

// --- AVM ---
function mallCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  const name = (tags.name || "").toLowerCase();
  if (name.includes("outlet")) {
    return { category: "Outlet", categoryKey: "outlet" };
  }
  return { category: "AVM", categoryKey: "avm" };
}

// --- Oto Yıkama ---
function carWashCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  const brand = (tags.brand || tags.operator || "").toLowerCase();
  const automated =
    (tags["car_wash"] || "").toLowerCase().includes("automated") ||
    (tags["self_service"] || "").toLowerCase() === "yes";

  // Benzin istasyonu içindeki yıkama — Shell, BP, OPET, PO vs.
  if (tags.amenity === "fuel") {
    const fuelBrand =
      tags.brand || tags.operator || tags.name?.split(" ")[0] || "";
    const pretty = fuelBrand
      ? fuelBrand
          .split(/[\s_-]+/)
          .map((w) => (w ? w[0].toUpperCase() + w.slice(1).toLowerCase() : ""))
          .join(" ")
      : "Benzinlik";
    return {
      category: `${pretty} · benzinlik yıkama`,
      categoryKey: "benzinlik",
    };
  }

  if (automated) {
    return { category: "Self-servis / Otomatik", categoryKey: "self" };
  }
  if (brand) {
    return { category: brand[0].toUpperCase() + brand.slice(1), categoryKey: "brand" };
  }
  return { category: "Oto Yıkama", categoryKey: "genel" };
}

// --- Taksi Durağı ---
function taxiCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  if (tags.name?.toLocaleLowerCase("tr").includes("havalim")) {
    return { category: "Havalimanı taksisi", categoryKey: "havalimani" };
  }
  if (tags.capacity && parseInt(tags.capacity) > 5) {
    return { category: "Büyük durak", categoryKey: "buyuk" };
  }
  return { category: "Taksi durağı", categoryKey: "durak" };
}

// --- Çekici / Yol Yardım ---
function towCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  const name = (tags.name || "").toLocaleLowerCase("tr");
  const towService =
    tags["service:vehicle:tow"] === "yes" ||
    tags["service:vehicle:roadside_assistance"] === "yes" ||
    /çekici|cekici|kurtarma|yol yardım|yardim|24 saat/i.test(name);
  if (towService) {
    return { category: "Çekici / Yol yardım", categoryKey: "cekici" };
  }
  if (tags.amenity === "car_repair") {
    return { category: "Oto servis", categoryKey: "servis" };
  }
  return { category: "Servis", categoryKey: "genel" };
}

// --- EV Şarj ---
function chargingCategory(tags: Record<string, string>): {
  category: string;
  categoryKey: string;
} {
  const op = (tags.operator || tags.brand || "").toLowerCase();
  const hasDc =
    !!tags["socket:ccs"] ||
    !!tags["socket:chademo"] ||
    !!tags["socket:type2_cable"];
  const power = parseFloat(tags["maxpower"] || tags["socket:type2:output"] || "0");

  // Operatör eşleme
  if (op.includes("trugo")) {
    return { category: "Trugo", categoryKey: "trugo" };
  }
  if (op.includes("zes")) {
    return { category: "ZES", categoryKey: "zes" };
  }
  if (op.includes("eşarj") || op.includes("esarj")) {
    return { category: "Eşarj", categoryKey: "esarj" };
  }
  if (op.includes("voltrun")) {
    return { category: "Voltrun", categoryKey: "voltrun" };
  }
  // Operatör yoksa hız sınıfla
  if (hasDc || power >= 50) {
    return { category: "DC Hızlı", categoryKey: "dc" };
  }
  return { category: "AC Şarj", categoryKey: "ac" };
}

// Bir POI tipi birden fazla Overpass filtresi gerektirebilir (örn. yıkama:
// hem amenity=car_wash, hem amenity=fuel+car_wash=yes).
function osmFilters(type: PoiType): string[] {
  switch (type) {
    case "hastane":
      return [`["amenity"~"^(hospital|clinic)$"]`];
    case "eczane":
      return [`["amenity"="pharmacy"]`];
    case "avm":
      return [`["shop"="mall"]`];
    case "sarj":
      return [`["amenity"="charging_station"]`];
    case "yikama":
      // 1) Müstakil oto yıkama, 2) Yıkaması olan benzin istasyonu
      return [
        `["amenity"="car_wash"]`,
        `["amenity"="fuel"]["car_wash"]`,
      ];
    case "taksi":
      return [`["amenity"="taxi"]`];
    case "cekici":
      return [`["amenity"~"^(car_repair|car_rental)$"]`];
  }
}

// İstanbul ili kapsayan bbox (Trakya kıyısı, Şile, Tuzla, kuzey ormanları dahil)
// south, west, north, east
const ISTANBUL_BBOX = "40.80,28.50,41.30,29.55";

function parseElements(data: { elements: RawEl[] }, type: PoiType): Poi[] {
  return data.elements
    .map((el) => {
      const tags = el.tags ?? {};
      const co =
        el.type === "node"
          ? { lat: el.lat!, lng: el.lon! }
          : { lat: el.center!.lat, lng: el.center!.lon };
      if (!Number.isFinite(co.lat) || !Number.isFinite(co.lng)) return null;
      if (!tags.name) return null;

      let cat;
      if (type === "hastane") cat = hospitalCategory(tags);
      else if (type === "eczane") cat = pharmacyCategory(tags);
      else if (type === "sarj") cat = chargingCategory(tags);
      else if (type === "yikama") cat = carWashCategory(tags);
      else if (type === "taksi") cat = taxiCategory(tags);
      else if (type === "cekici") cat = towCategory(tags);
      else cat = mallCategory(tags);

      return {
        id: `${el.type[0]}${el.id}`,
        name: tags.name,
        lng: co.lng,
        lat: co.lat,
        category: cat.category,
        categoryKey: cat.categoryKey,
        address: tags["addr:full"] || tags["addr:street"],
        phone: tags.phone || tags["contact:phone"],
        openHours: tags.opening_hours,
        website: tags.website || tags["contact:website"],
        isOnDuty: "isOnDuty" in cat ? cat.isOnDuty : undefined,
      } as Poi;
    })
    .filter((x): x is Poi => x !== null);
}

// Yakın çevre (lat, lng + radius)
export async function fetchPoi(
  type: PoiType,
  lat: number,
  lng: number,
  radiusMeters = 3000
): Promise<Poi[]> {
  const filters = osmFilters(type);
  const body = filters
    .flatMap((f) => [
      `node(around:${radiusMeters},${lat},${lng})${f};`,
      `way(around:${radiusMeters},${lat},${lng})${f};`,
    ])
    .join("\n      ");
  const query = `
    [out:json][timeout:25];
    (
      ${body}
    );
    out tags center 400;
  `.trim();
  const data = await overpass(query);
  return parseElements(data, type);
}

// Tüm İstanbul (bbox sorgu, yüksek timeout + büyük limit)
export async function fetchPoiIstanbul(type: PoiType): Promise<Poi[]> {
  const filters = osmFilters(type);
  const body = filters
    .flatMap((f) => [
      `node${f}(${ISTANBUL_BBOX});`,
      `way${f}(${ISTANBUL_BBOX});`,
    ])
    .join("\n      ");
  const query = `
    [out:json][timeout:90];
    (
      ${body}
    );
    out tags center 2500;
  `.trim();
  const data = await overpass(query);
  return parseElements(data, type);
}

// Marker renkleri — type + categoryKey'e göre
export function poiMarkerColor(type: PoiType, categoryKey: string): string {
  if (type === "hastane") {
    switch (categoryKey) {
      case "devlet":
        return "#2eb872"; // yeşil
      case "ozel":
        return "#e95696"; // pembe
      case "universite":
        return "#f5a524"; // amber
      default:
        return "#7d8aa3"; // gri
    }
  }
  if (type === "eczane") {
    switch (categoryKey) {
      case "h24":
        return "#2eb872";
      default:
        return "#c84b4b";
    }
  }
  if (type === "sarj") {
    switch (categoryKey) {
      case "trugo":
        return "#e95696";
      case "zes":
        return "#2db7ab";
      case "esarj":
        return "#f5a524";
      case "voltrun":
        return "#1d4b8f";
      case "dc":
        return "#2eb872";
      default:
        return "#7d8aa3";
    }
  }
  if (type === "yikama") {
    switch (categoryKey) {
      case "self":
        return "#2eb872"; // yeşil — self servis
      case "brand":
        return "#1d4b8f"; // mavi — markalı
      case "benzinlik":
        return "#f5a524"; // amber — benzin istasyonu yıkaması
      default:
        return "#2db7ab"; // turkuaz — genel
    }
  }
  if (type === "taksi") {
    switch (categoryKey) {
      case "havalimani":
        return "#e95696";
      case "buyuk":
        return "#2eb872";
      default:
        return "#f5a524";
    }
  }
  if (type === "cekici") {
    switch (categoryKey) {
      case "cekici":
        return "#c84b4b"; // kırmızı — açık çekici/yol yardım
      case "servis":
        return "#1d4b8f"; // mavi — oto servis
      default:
        return "#7d8aa3";
    }
  }
  // AVM
  switch (categoryKey) {
    case "outlet":
      return "#f5a524";
    default:
      return "#2db7ab";
  }
}

export function poiLegend(
  type: PoiType
): { color: string; label: string; key: string }[] {
  if (type === "hastane") {
    return [
      { color: "#2eb872", label: "Devlet", key: "devlet" },
      { color: "#e95696", label: "Özel", key: "ozel" },
      { color: "#f5a524", label: "Üniversite", key: "universite" },
      { color: "#7d8aa3", label: "Diğer", key: "genel" },
    ];
  }
  if (type === "eczane") {
    return [
      { color: "#2eb872", label: "24 saat / nöbetçi*", key: "h24" },
      { color: "#c84b4b", label: "Saatli", key: "normal" },
    ];
  }
  if (type === "sarj") {
    return [
      { color: "#2eb872", label: "DC Hızlı", key: "dc" },
      { color: "#e95696", label: "Trugo", key: "trugo" },
      { color: "#2db7ab", label: "ZES", key: "zes" },
      { color: "#f5a524", label: "Eşarj", key: "esarj" },
      { color: "#1d4b8f", label: "Voltrun", key: "voltrun" },
      { color: "#7d8aa3", label: "AC Yavaş", key: "ac" },
    ];
  }
  if (type === "yikama") {
    return [
      { color: "#2eb872", label: "Self / Otomatik", key: "self" },
      { color: "#1d4b8f", label: "Markalı", key: "brand" },
      { color: "#2db7ab", label: "Genel", key: "genel" },
    ];
  }
  if (type === "taksi") {
    return [
      { color: "#f5a524", label: "Klasik durak", key: "durak" },
      { color: "#2eb872", label: "Büyük durak", key: "buyuk" },
      { color: "#e95696", label: "Havalimanı", key: "havalimani" },
    ];
  }
  if (type === "cekici") {
    return [
      { color: "#c84b4b", label: "Çekici / Yol yardım", key: "cekici" },
      { color: "#1d4b8f", label: "Oto servis", key: "servis" },
    ];
  }
  return [
    { color: "#2db7ab", label: "AVM", key: "avm" },
    { color: "#f5a524", label: "Outlet", key: "outlet" },
  ];
}
