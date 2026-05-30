// İBB Açık API ile gerçek İSPARK verisi
// https://api.ibb.gov.tr/ispark/Park            → tüm liste (canlı emptyCapacity)
// https://api.ibb.gov.tr/ispark/ParkDetay?id=X  → tek otopark detayı + tarife

export type IsparkParkType =
  | "kapali"
  | "acik"
  | "yol-ustu"
  | "diger";

export type IsparkLive = {
  id: number;
  name: string;
  lng: number;
  lat: number;
  capacity: number;
  emptyCapacity: number;
  district: string;
  parkType: IsparkParkType;
  parkTypeRaw: string;
  isOpen: boolean;
  workHours?: string;
  freeTimeMin?: number;
};

export type IsparkDetail = IsparkLive & {
  address?: string;
  monthlyFee?: number;
  tariffRaw?: string;
  tariff?: TariffTier[];
  updateDate?: string; // "29.05.2026 14:20:00"
};

export type TariffTier = {
  rangeLabel: string; // "0-1 Saat"
  priceTl: number;    // 110
};

function normalizeParkType(raw: string): IsparkParkType {
  const r = raw.toLocaleUpperCase("tr");
  if (r.includes("KAPALI")) return "kapali";
  if (r.includes("AÇIK")) return "acik";
  if (r.includes("YOL")) return "yol-ustu";
  return "diger";
}

type RawList = {
  parkID: number;
  parkName: string;
  lat: string;
  lng: string;
  capacity: number;
  emptyCapacity: number;
  workHours?: string;
  parkType: string;
  freeTime?: number;
  district: string;
  isOpen?: number;
};

type RawDetail = RawList & {
  address?: string;
  monthlyFee?: number;
  tariff?: string;
  updateDate?: string;
};

async function fetchIbb<T>(url: string, revalidate: number): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "istbam/0.1 (hello@istbam.app)",
    },
    next: { revalidate, tags: ["ispark"] },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchIsparkList(): Promise<IsparkLive[]> {
  const raw = await fetchIbb<RawList[]>(
    "https://api.ibb.gov.tr/ispark/Park",
    60 // canlı doluluk: 60 sn cache
  );
  return raw
    .filter((r) => r.lat && r.lng)
    .map<IsparkLive>((r) => ({
      id: r.parkID,
      name: r.parkName,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lng),
      capacity: r.capacity ?? 0,
      emptyCapacity: Math.max(0, r.emptyCapacity ?? 0),
      district: r.district ?? "",
      parkType: normalizeParkType(r.parkType ?? ""),
      parkTypeRaw: r.parkType ?? "",
      isOpen: r.isOpen !== 0,
      workHours: r.workHours,
      freeTimeMin: r.freeTime,
    }))
    .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
}

export async function fetchIsparkDetail(id: number): Promise<IsparkDetail> {
  const arr = await fetchIbb<RawDetail[]>(
    `https://api.ibb.gov.tr/ispark/ParkDetay?id=${encodeURIComponent(String(id))}`,
    300 // tarife 5 dk cache (sık değişmez)
  );
  const r = arr[0];
  if (!r) throw new Error("Park bulunamadı");

  const tariff = parseTariff(r.tariff);

  return {
    id: r.parkID,
    name: r.parkName,
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lng),
    capacity: r.capacity ?? 0,
    emptyCapacity: Math.max(0, r.emptyCapacity ?? 0),
    district: r.district ?? "",
    parkType: normalizeParkType(r.parkType ?? ""),
    parkTypeRaw: r.parkType ?? "",
    isOpen: r.isOpen !== 0,
    workHours: r.workHours,
    freeTimeMin: r.freeTime,
    address: r.address,
    monthlyFee: r.monthlyFee,
    tariffRaw: r.tariff,
    tariff,
    updateDate: r.updateDate,
  };
}

// "0-1 Saat : 110,00;1-2 Saat : 140,00;..." → [{rangeLabel:"0-1 Saat", priceTl:110}, ...]
function parseTariff(raw?: string): TariffTier[] | undefined {
  if (!raw) return undefined;
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, priceRaw] = part.split(":").map((s) => s.trim());
      const price = parseFloat((priceRaw ?? "0").replace(/\./g, "").replace(",", "."));
      return { rangeLabel: label, priceTl: Number.isFinite(price) ? price : 0 };
    });
}

export function isparkFirstHourPrice(p: IsparkDetail): number | undefined {
  return p.tariff?.[0]?.priceTl;
}

export function isparkOccupiedPct(p: IsparkLive): number {
  if (!p.capacity) return 0;
  return Math.round(((p.capacity - p.emptyCapacity) / p.capacity) * 100);
}
