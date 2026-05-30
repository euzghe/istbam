// Seed data — gerçek İBB Open Data API entegrasyonuna kadar.
// İSPARK gerçek konum ve fiyat aralıkları, doluluk simüle.
export type Ispark = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  capacity: number;
  occupied: number; // 0..capacity
  hourlyTl: number;
  type: "yol-ustu" | "kapali" | "acik";
  district: string;
};

export const ISPARKS: Ispark[] = [
  {
    id: "ip-beyazit",
    name: "Beyazıt İSPARK",
    lng: 28.9658,
    lat: 41.0103,
    capacity: 180,
    occupied: 112,
    hourlyTl: 35,
    type: "kapali",
    district: "Fatih",
  },
  {
    id: "ip-sultanahmet",
    name: "Sultanahmet İSPARK",
    lng: 28.9772,
    lat: 41.0054,
    capacity: 95,
    occupied: 86,
    hourlyTl: 45,
    type: "yol-ustu",
    district: "Fatih",
  },
  {
    id: "ip-eminonu",
    name: "Eminönü Otopark",
    lng: 28.9706,
    lat: 41.0173,
    capacity: 240,
    occupied: 92,
    hourlyTl: 40,
    type: "kapali",
    district: "Fatih",
  },
  {
    id: "ip-taksim",
    name: "Taksim Maksem",
    lng: 28.9866,
    lat: 41.0367,
    capacity: 320,
    occupied: 298,
    hourlyTl: 60,
    type: "kapali",
    district: "Beyoğlu",
  },
  {
    id: "ip-karakoy",
    name: "Karaköy Salı Pazarı",
    lng: 28.9772,
    lat: 41.0258,
    capacity: 140,
    occupied: 65,
    hourlyTl: 50,
    type: "acik",
    district: "Beyoğlu",
  },
  {
    id: "ip-besiktas",
    name: "Beşiktaş Meydan",
    lng: 29.0093,
    lat: 41.0432,
    capacity: 210,
    occupied: 180,
    hourlyTl: 55,
    type: "yol-ustu",
    district: "Beşiktaş",
  },
  {
    id: "ip-kadikoy",
    name: "Kadıköy İskele",
    lng: 29.0247,
    lat: 40.9923,
    capacity: 175,
    occupied: 102,
    hourlyTl: 40,
    type: "kapali",
    district: "Kadıköy",
  },
  {
    id: "ip-uskudar",
    name: "Üsküdar Meydan",
    lng: 29.0156,
    lat: 41.0264,
    capacity: 160,
    occupied: 71,
    hourlyTl: 35,
    type: "yol-ustu",
    district: "Üsküdar",
  },
];

export function isparkFillPct(p: Ispark) {
  return Math.round((p.occupied / p.capacity) * 100);
}
export function isparkFree(p: Ispark) {
  return p.capacity - p.occupied;
}
