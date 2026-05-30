// HGS (Hızlı Geçiş Sistemi) 2026 ücret tarifesi — 1. sınıf araç (otomobil).
// Açık API yok; rakamlar operatör resmi sayfalarından manuel toplandı.
// "Son güncelleme" tarihiyle birlikte gösterilecek.

export type HgsToll = {
  id: string;
  name: string;
  group: "kopru" | "otoyol" | "tunel";
  // 1. sınıf araç tek geçiş (TL)
  class1Tl: number;
  // Operatör/yönetici
  operator: string;
  // Resmi tarife sayfası
  tariffUrl: string;
  // İsteğe bağlı kısa açıklama (örn. "İstanbul-Anadolu", "tüm güzergah")
  description?: string;
};

export const HGS_TARIFF = {
  updatedAt: "2026-05-30",
  source: "Operatör resmi sayfaları + KGM",
  tolls: [
    // ---- KÖPRÜLER ----
    {
      id: "kopru-15temmuz",
      name: "15 Temmuz Şehitler Köprüsü",
      group: "kopru",
      class1Tl: 145,
      operator: "KGM",
      tariffUrl: "https://www.kgm.gov.tr",
      description: "Boğaz · İstanbul iç geçiş",
    },
    {
      id: "kopru-fsm",
      name: "Fatih Sultan Mehmet Köprüsü",
      group: "kopru",
      class1Tl: 145,
      operator: "KGM",
      tariffUrl: "https://www.kgm.gov.tr",
      description: "Boğaz · TEM bağlantılı",
    },
    {
      id: "kopru-yss",
      name: "Yavuz Sultan Selim Köprüsü",
      group: "kopru",
      class1Tl: 460,
      operator: "3. Köprü ve Otoyol A.Ş.",
      tariffUrl: "https://3kib.com",
      description: "Kuzey Marmara · Odayeri-Pasaköy",
    },
    {
      id: "kopru-osmangazi",
      name: "Osmangazi Köprüsü",
      group: "kopru",
      class1Tl: 1175,
      operator: "Otoyol A.Ş. (NÖMAYG)",
      tariffUrl: "https://osmangazikoprusu.com",
      description: "Gebze-Orhangazi · Yalova bağlantısı",
    },
    {
      id: "kopru-canakkale",
      name: "1915 Çanakkale Köprüsü",
      group: "kopru",
      class1Tl: 1265,
      operator: "Çanakkale Otoyol",
      tariffUrl: "https://www.1915canakkale.com",
      description: "Lapseki-Gelibolu",
    },
    // ---- TÜNEL ----
    {
      id: "tunel-avrasya",
      name: "Avrasya Tüneli",
      group: "tunel",
      class1Tl: 315,
      operator: "ATAŞ",
      tariffUrl: "https://avrasyatuneli.com",
      description: "Kazlıçeşme-Göztepe deniz altı",
    },
    // ---- OTOYOL SEGMENTLERİ (örnek başlıca) ----
    {
      id: "otoyol-tem-istanbul-ankara",
      name: "TEM (İstanbul → Ankara)",
      group: "otoyol",
      class1Tl: 215,
      operator: "KGM",
      tariffUrl: "https://www.kgm.gov.tr",
      description: "Tam güzergah ortalama",
    },
    {
      id: "otoyol-o7-kuzeymarmara",
      name: "O-7 Kuzey Marmara (Kınalı → Akyazı)",
      group: "otoyol",
      class1Tl: 510,
      operator: "ICA",
      tariffUrl: "https://icaotoyol.com.tr",
      description: "YSS Köprüsü dahil değil — ek tarife",
    },
    {
      id: "otoyol-o5-istanbul-izmir",
      name: "O-5 İstanbul-İzmir (tam güzergah)",
      group: "otoyol",
      class1Tl: 2055,
      operator: "Otoyol A.Ş.",
      tariffUrl: "https://www.otoyolas.com.tr",
      description: "Gebze-İzmir · Osmangazi Köprüsü dahil",
    },
    {
      id: "otoyol-o4-tem-anadolu",
      name: "O-4 (Anadolu) Trakya-Edirne",
      group: "otoyol",
      class1Tl: 175,
      operator: "KGM",
      tariffUrl: "https://www.kgm.gov.tr",
      description: "İstanbul-Edirne",
    },
  ] satisfies HgsToll[],
};

export const HGS_QUERY_URL = "https://hgs.ptt.gov.tr/Sayfalar/HGSBakiye.aspx";
export const HGS_OFFICIAL_HOME = "https://hgs.ptt.gov.tr";
