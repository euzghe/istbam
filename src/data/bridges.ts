// Boğaz geçişleri — 2026 başı yayımlanan resmi tarifeler.
// Per-köprü canlı yoğunluk API'sı yok; tahmin İBB Trafik İndeksi'nden türetilir.
// Tarifeler periyodik güncellenir — kontrol edilmesi gereken kaynaklar:
// - KGM: https://www.kgm.gov.tr  (15 Temmuz, FSM)
// - 3. Köprü ve Otoyol A.Ş. — Yavuz Sultan Selim Köprüsü ücretleri
// - https://avrasyatuneli.com (Avrasya Tüneli)
// - https://osmangazikoprusu.com (Osmangazi)

export type Bridge = {
  id: string;
  name: string;
  shortName: string;
  // Sınıf 1 araç (otomobil) tek geçiş ücreti, TL
  tollClass1Tl: number;
  // Geçiş operatörü/sağlayıcı
  operator: string;
  // Resmi tarife kaynağı linki
  tariffSourceUrl: string;
  // Tipik geçiş süresi (kavşaktan kavşağa) dk — trafiğe göre değişir
  baseTravelMin: number;
  // Şehir indeksine göre yoğunluk çarpanı (örn. boğaz hatları daha yoğun)
  congestionMultiplier: number;
};

// Son doğrulama: 2026-01 — kullanıcı tarafından son güncel rakamlarla
// karşılaştırılmalı. Değişirse buradan güncelle, kart otomatik yansıtacak.
export const BRIDGES: Bridge[] = [
  {
    id: "boğazici",
    name: "15 Temmuz Şehitler Köprüsü",
    shortName: "15 Temmuz",
    tollClass1Tl: 145,
    operator: "KGM",
    tariffSourceUrl: "https://www.kgm.gov.tr",
    baseTravelMin: 18,
    congestionMultiplier: 1.3,
  },
  {
    id: "fsm",
    name: "Fatih Sultan Mehmet Köprüsü",
    shortName: "FSM",
    tollClass1Tl: 145,
    operator: "KGM",
    tariffSourceUrl: "https://www.kgm.gov.tr",
    baseTravelMin: 16,
    congestionMultiplier: 1.2,
  },
  {
    id: "yss",
    name: "Yavuz Sultan Selim Köprüsü",
    shortName: "YSS (3. Köprü)",
    tollClass1Tl: 460,
    operator: "3. Köprü Otoyol A.Ş.",
    tariffSourceUrl: "https://3kib.com",
    baseTravelMin: 22,
    congestionMultiplier: 0.7,
  },
  {
    id: "avrasya",
    name: "Avrasya Tüneli",
    shortName: "Avrasya Tüneli",
    tollClass1Tl: 315,
    operator: "ATAŞ — Avrasya Tüneli",
    tariffSourceUrl: "https://avrasyatuneli.com",
    baseTravelMin: 8,
    congestionMultiplier: 0.5,
  },
];

// Şehir indeksi (0-100) + köprü çarpanını alıp tahmini yoğunluk üretir
export function bridgeEstimatedDensity(
  cityIndex: number,
  multiplier: number
): number {
  return Math.min(100, Math.max(0, Math.round(cityIndex * multiplier)));
}

// Tahmini geçiş süresi: yoğunluğa göre baseTravelMin'in 1.0-2.5 katı
export function bridgeEstimatedMin(
  baseMin: number,
  density: number
): number {
  const factor = 1 + (density / 100) * 1.5;
  return Math.round(baseMin * factor);
}
