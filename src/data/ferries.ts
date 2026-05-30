// Arabalı vapur — gerçek operatör tarifeleri.
// İstanbul bölgesinde tek aktif arabalı vapur hattı: Gestaş Eskihisar-Topçular.
// Diğer "arabalı vapur" arayışları artık yolcu deniz otobüsü (İDO) veya
// kapanmış hatlar (Yenikapı-Bandırma, Harem-Sirkeci 2006'da kalktı).
//
// Anlık sefer saatleri için açık API yok — resmi sayfa scrape edilemediği
// için kart kullanıcıyı doğrudan operatöre yönlendiriyor.

export type FerryRoute = {
  id: string;
  from: string;
  to: string;
  operator: string;
  category: "arabali" | "yolcu-deniz-otobusu";
  // Tipik yolculuk süresi (operator beyanı, dk)
  durationMin: number;
  // Karayolu alternatifi (kabaca, dk) — sezgisel karşılaştırma
  roadAltMin: number;
  scheduleUrl: string;
  description?: string;
};

export const FERRIES: FerryRoute[] = [
  {
    id: "eskihisar-topcular",
    from: "Eskihisar",
    to: "Topçular",
    operator: "Gestaş",
    category: "arabali",
    durationMin: 45,
    roadAltMin: 165,
    scheduleUrl: "https://www.gestasdenizulasim.com.tr/tr/sefer-saatleri",
    description:
      "İstanbul–Yalova/Bursa arasında zaman kazandıran tek aktif arabalı vapur hattı.",
  },
];

// Yolcu deniz otobüsü hatları (araç taşımaz, bilgi için)
export const PASSENGER_SEABUS: FerryRoute[] = [
  {
    id: "pendik-yalova-seabus",
    from: "Pendik",
    to: "Yalova",
    operator: "İDO",
    category: "yolcu-deniz-otobusu",
    durationMin: 55,
    roadAltMin: 130,
    scheduleUrl: "https://www.ido.com.tr/",
    description: "Sadece yolcu — araç almaz.",
  },
  {
    id: "bursa-yenikapi-seabus",
    from: "Yenikapı",
    to: "Bursa/Mudanya",
    operator: "BUDO",
    category: "yolcu-deniz-otobusu",
    durationMin: 120,
    roadAltMin: 220,
    scheduleUrl: "https://www.burulas.com.tr/",
    description: "Sadece yolcu — araç almaz.",
  },
];
