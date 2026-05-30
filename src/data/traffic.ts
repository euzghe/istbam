export type Crossing = {
  id: string;
  name: string;
  shortName: string;
  // 0-100 yoğunluk (100 = tıkalı)
  density: number;
  travelMin: number;
  tollTl: number;
};

export const CROSSINGS: Crossing[] = [
  { id: "bogazici", name: "15 Temmuz Şehitler Köprüsü", shortName: "Boğaziçi K.", density: 78, travelMin: 22, tollTl: 95 },
  { id: "fsm", name: "Fatih Sultan Mehmet Köprüsü", shortName: "FSM Köprüsü", density: 54, travelMin: 18, tollTl: 95 },
  { id: "yss", name: "Yavuz Sultan Selim Köprüsü", shortName: "YSS Köprüsü", density: 31, travelMin: 28, tollTl: 305 },
  { id: "marmaray", name: "Avrasya Tüneli (oto)", shortName: "Avrasya Tüneli", density: 42, travelMin: 8, tollTl: 235 },
];

export type RoadAlert = {
  id: string;
  type: "kapali" | "kaza" | "calisma" | "yogun";
  road: string;
  detail: string;
  startedAt: string; // human readable
};

export const ALERTS: RoadAlert[] = [
  {
    id: "a1",
    type: "kaza",
    road: "TEM Otoyolu — Bayrampaşa mevkii",
    detail: "Sağ şerit kapalı, 2 km kuyruk.",
    startedAt: "14 dk önce",
  },
  {
    id: "a2",
    type: "calisma",
    road: "Sahil Yolu — Florya",
    detail: "Asfalt çalışması, 1 şerit daraltma 21:00'a kadar.",
    startedAt: "Sabah 06:00",
  },
  {
    id: "a3",
    type: "yogun",
    road: "Boğaziçi Köprüsü — Avrupa istikameti",
    detail: "Yoğun trafik, FSM önerilir.",
    startedAt: "8 dk önce",
  },
];
