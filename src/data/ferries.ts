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

// İstanbul içi popüler vapur hatları — Şehir Hatları (klasik) + Adalar + Boğaz
export type CityFerry = {
  id: string;
  from: string;
  to: string;
  operator: string;
  kind: "klasik" | "hizli";
  desc?: string;
  url: string;
};

export const CITY_FERRIES: CityFerry[] = [
  // Avrupa-Anadolu klasik hatlar
  {
    id: "karakoy-kadikoy",
    from: "Karaköy",
    to: "Kadıköy",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Şehrin en sık seferli klasik vapur hattı (~20 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "eminonu-kadikoy",
    from: "Eminönü",
    to: "Kadıköy",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Tarihi yarımadadan Anadolu yakasına klasik geçiş (~25 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "eminonu-uskudar",
    from: "Eminönü",
    to: "Üsküdar",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Eminönü-Üsküdar — hızlı şehir içi geçiş (~15 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "besiktas-uskudar",
    from: "Beşiktaş",
    to: "Üsküdar",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Boğaz'ın iki yakası arası (~15 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "besiktas-kadikoy",
    from: "Beşiktaş",
    to: "Kadıköy",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Avrupa-Anadolu klasik bir hat (~30 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "eminonu-besiktas-kanlica",
    from: "Eminönü",
    to: "Anadolu Kavağı",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Boğaz Hattı — Eminönü'den Anadolu Kavağı'na kadar 6 iskele.",
    url: "https://sehirhatlari.istanbul",
  },

  // Adalar
  {
    id: "kabatas-adalar",
    from: "Kabataş",
    to: "Adalar (Büyükada vb.)",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Klasik Adalar vapuru (~90 dk Büyükada).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "kadikoy-adalar",
    from: "Kadıköy",
    to: "Adalar",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Kadıköy'den Burgaz/Heybeli/Büyükada (~75 dk).",
    url: "https://sehirhatlari.istanbul",
  },
  {
    id: "bostanci-adalar",
    from: "Bostancı",
    to: "Adalar",
    operator: "Şehir Hatları",
    kind: "klasik",
    desc: "Bostancı'dan Adalar (~30-45 dk).",
    url: "https://sehirhatlari.istanbul",
  },

  // İDO deniz otobüsü hızlı hatlar
  {
    id: "ido-bostanci-adalar",
    from: "Bostancı",
    to: "Adalar (deniz otobüsü)",
    operator: "İDO",
    kind: "hizli",
    desc: "Hızlı deniz otobüsüyle Adalar — daha kısa süre.",
    url: "https://www.ido.com.tr",
  },
  {
    id: "ido-yenikapi-adalar",
    from: "Yenikapı",
    to: "Adalar (deniz otobüsü)",
    operator: "İDO",
    kind: "hizli",
    desc: "Yenikapı'dan hızlı deniz otobüsü ile Adalar.",
    url: "https://www.ido.com.tr",
  },

  // BUDO Bursa hatları
  {
    id: "budo-eminonu-mudanya",
    from: "Eminönü",
    to: "Mudanya (BUDO)",
    operator: "BUDO",
    kind: "hizli",
    desc: "Eminönü'den Bursa Mudanya'ya hızlı feribot (~2 sa).",
    url: "https://www.burulas.com.tr",
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
