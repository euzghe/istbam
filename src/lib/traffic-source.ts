// İBB Trafik İndeksi — şehir geneli yoğunluk
// https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndexHistory/1/5M
// Her 5 dakikada bir okuma; 0-100 arası yoğunluk endeksi

export type TrafficReading = {
  index: number; // 0-100
  at: string;    // ISO date
};

export type TrafficSnapshot = {
  source: "ibb";
  current: TrafficReading;
  // Son 60 dk içindeki okumalar (en yeniden eskiye)
  recent: TrafficReading[];
  // Son 60 dk içindeki min/max/ortalama
  hourAvg: number;
  // Trend: son okuma bir öncekinden ne kadar farklı
  deltaLast: number;
  fetchedAt: number;
};

export type TrafficEmpty = {
  source: "empty";
  reason: string;
};

const TRAFFIC_URL =
  "https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndexHistory/1/5M";

type Raw = { TrafficIndex: number; TrafficIndexDate: string };

export async function fetchTrafficSnapshot(): Promise<
  TrafficSnapshot | TrafficEmpty
> {
  try {
    const res = await fetch(TRAFFIC_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "istbam/0.1 (hello@istbam.app)",
      },
      next: { revalidate: 60, tags: ["traffic"] },
    });
    if (!res.ok) {
      return { source: "empty", reason: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as Raw[];
    if (!data?.length) return { source: "empty", reason: "Boş veri" };

    // En yeni okumalar başta
    const readings: TrafficReading[] = data
      .map((r) => ({ index: r.TrafficIndex, at: r.TrafficIndexDate }))
      .sort((a, b) => (a.at < b.at ? 1 : -1));

    const current = readings[0];
    const previous = readings[1];
    const deltaLast = previous ? current.index - previous.index : 0;

    // Son 60 dk (12 okuma)
    const recent = readings.slice(0, 12);
    const hourAvg =
      recent.length > 0
        ? Math.round(
            recent.reduce((s, r) => s + r.index, 0) / recent.length
          )
        : current.index;

    return {
      source: "ibb",
      current,
      recent,
      hourAvg,
      deltaLast,
      fetchedAt: Date.now(),
    };
  } catch (e) {
    return { source: "empty", reason: (e as Error).message };
  }
}

export function trafficStatusTr(index: number): {
  label: string;
  tone: "good" | "warn" | "bad";
} {
  if (index < 30) return { label: "Akıcı", tone: "good" };
  if (index < 55) return { label: "Normal", tone: "good" };
  if (index < 75) return { label: "Yoğun", tone: "warn" };
  return { label: "Çok yoğun", tone: "bad" };
}
