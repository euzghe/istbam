// İstanbul'un OSM'de turn:lanes etiketi olmayan kritik kavşakları için
// elle hazırlanmış şerit-hedef veritabanı.
//
// Eşleme: OSRM rotasının sıradaki manevra noktası bu kavşakların
// matchRadius'una girerse, LaneCard bu manuel şeritleri gösterir.

export type ManualLane = {
  no: number; // soldan sağa 1..N
  arrow: "←" | "↖" | "↑" | "↗" | "→" | "↩" | "↰" | "↱";
  destinations: string[]; // tabela ipucu (ilki büyük gösterilir)
};

export type ManualJunction = {
  id: string;
  name: string;
  approach: string; // "Beşiktaş yönünden gelirken"
  lat: number;
  lng: number;
  warnMeters: number; // sürücüye ne zaman gösterilmeye başlasın
  matchRadius: number; // OSRM manevra noktası bu yarıçap içinde olursa eşleşir (metre)
  lanes: ManualLane[];
  trap?: string; // sık kaçırılan ipucu
};

export const MANUAL_JUNCTIONS: ManualJunction[] = [
  // =========================
  // BOĞAZ KÖPRÜ YAKLAŞIMLARI
  // =========================
  {
    id: "15temmuz-avrupa",
    name: "15 Temmuz Şehitler Köprüsü — Avrupa Girişi",
    approach: "Sahil/Ortaköy/Beşiktaş yönünden",
    lat: 41.045,
    lng: 29.034,
    warnMeters: 700,
    matchRadius: 250,
    trap: "Köprüye sol şeritlerden geçilir; sağda kalırsan Sahil Yolu'na devam edersin.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["15 Temmuz Köprüsü", "Anadolu Yakası", "Kadıköy"] },
      { no: 2, arrow: "↑", destinations: ["15 Temmuz Köprüsü", "Anadolu Yakası"] },
      { no: 3, arrow: "↑", destinations: ["Sahil Yolu Devam", "Kuruçeşme"] },
      { no: 4, arrow: "↑", destinations: ["Sahil Yolu", "Arnavutköy"] },
    ],
  },
  {
    id: "15temmuz-anadolu",
    name: "15 Temmuz Şehitler Köprüsü — Anadolu Girişi",
    approach: "Üsküdar/Beylerbeyi yönünden",
    lat: 41.045,
    lng: 29.04,
    warnMeters: 600,
    matchRadius: 250,
    trap: "Avrupa yakasına geçişte en sağ şerit Çevreyolu çıkışına gider.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["15 Temmuz Köprüsü", "Avrupa Yakası", "Mecidiyeköy"] },
      { no: 2, arrow: "↑", destinations: ["15 Temmuz Köprüsü", "Avrupa Yakası"] },
      { no: 3, arrow: "↗", destinations: ["E-5 Çevre Yolu", "Kadıköy"] },
    ],
  },
  {
    id: "fsm-avrupa-hisarustu",
    name: "FSM Köprüsü — Avrupa Yaklaşımı (Hisarüstü)",
    approach: "Hisarüstü/Levent yönünden",
    lat: 41.083,
    lng: 29.057,
    warnMeters: 800,
    matchRadius: 300,
    trap: "Çevreyolu (Hadımköy) ve FSM ayrımı 250 m kala başlar; karar bunu kaçırma.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["TEM Çevreyolu", "Maslak", "Hadımköy"] },
      { no: 2, arrow: "↗", destinations: ["FSM Köprüsü", "Kavacık", "Anadolu Yakası"] },
      { no: 3, arrow: "↗", destinations: ["FSM Köprüsü", "Kavacık"] },
      { no: 4, arrow: "↗", destinations: ["FSM Köprüsü", "Anadolu", "Sabiha Gökçen"] },
    ],
  },
  {
    id: "fsm-anadolu-kavacik",
    name: "FSM Köprüsü — Anadolu Yaklaşımı (Kavacık)",
    approach: "Kavacık/Beykoz yönünden",
    lat: 41.085,
    lng: 29.06,
    warnMeters: 700,
    matchRadius: 300,
    trap: "Kavacık'tan gelirken sağ şeritler FSM'ye, sol şeritler Çevreyolu (TEM Ankara) yönüne ayrılır.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["TEM Çevreyolu Devam", "Ankara"] },
      { no: 2, arrow: "↖", destinations: ["FSM Köprüsü", "Avrupa Yakası", "Mecidiyeköy"] },
      { no: 3, arrow: "↖", destinations: ["FSM Köprüsü", "Avrupa Yakası"] },
    ],
  },
  {
    id: "yss-avrupa-odayeri",
    name: "YSS Köprüsü — Avrupa Yaklaşımı (Odayeri)",
    approach: "Odayeri Gişeleri / Kuzey Marmara Otoyolu (O-7)",
    lat: 41.197,
    lng: 29.107,
    warnMeters: 1000,
    matchRadius: 400,
    trap: "Otoyol ücretli; geri dönüş yok. HGS bakiyenden emin ol.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["YSS Köprüsü", "Anadolu", "Sabiha Gökçen"] },
      { no: 2, arrow: "↑", destinations: ["YSS Köprüsü", "Anadolu"] },
      { no: 3, arrow: "↑", destinations: ["YSS Köprüsü", "Pasaköy"] },
    ],
  },
  {
    id: "yss-anadolu-pasakoy",
    name: "YSS Köprüsü — Anadolu Yaklaşımı (Pasaköy)",
    approach: "Pasaköy/Çekmeköy yönünden",
    lat: 41.197,
    lng: 29.111,
    warnMeters: 900,
    matchRadius: 400,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["YSS Köprüsü", "Avrupa", "Hadımköy"] },
      { no: 2, arrow: "↑", destinations: ["YSS Köprüsü", "Avrupa"] },
      { no: 3, arrow: "↑", destinations: ["YSS Köprüsü", "Odayeri"] },
    ],
  },

  // =========================
  // AVRASYA TÜNELİ
  // =========================
  {
    id: "avrasya-avrupa-kazlicesme",
    name: "Avrasya Tüneli — Avrupa Girişi (Kazlıçeşme)",
    approach: "Sahil yolu Bakırköy yönünden",
    lat: 40.998,
    lng: 28.95,
    warnMeters: 600,
    matchRadius: 250,
    trap: "Tünel girişine sol şeritten girilir. Sağ şeritte kalırsan Yedikule/Eminönü'ne çıkarsın.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Avrasya Tüneli", "Anadolu", "Göztepe"] },
      { no: 2, arrow: "↑", destinations: ["Avrasya Tüneli", "Anadolu"] },
      { no: 3, arrow: "↗", destinations: ["Sahil Devam", "Yedikule", "Eminönü"] },
    ],
  },
  {
    id: "avrasya-anadolu-goztepe",
    name: "Avrasya Tüneli — Anadolu Çıkışı (Göztepe)",
    approach: "Göztepe/Kalamış yönünden",
    lat: 40.97,
    lng: 29.045,
    warnMeters: 500,
    matchRadius: 250,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Avrasya Tüneli", "Avrupa", "Kazlıçeşme"] },
      { no: 2, arrow: "↑", destinations: ["Avrasya Tüneli", "Avrupa"] },
      { no: 3, arrow: "↗", destinations: ["Bağdat Cd Devam", "Kadıköy"] },
    ],
  },

  // =========================
  // MERKEZİ AVRUPA KAVŞAKLARI
  // =========================
  {
    id: "mecidiyekoy",
    name: "Mecidiyeköy Kavşağı",
    approach: "Şişli/Otomarsan yönünden",
    lat: 41.067,
    lng: 28.999,
    warnMeters: 500,
    matchRadius: 200,
    trap: "Boğaziçi Köprüsü ve TEM (FSM) ayrımı çok geç işaretlenir.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["E-5 Devam", "Zincirlikuyu", "Levent"] },
      { no: 2, arrow: "↑", destinations: ["Boğaziçi Köprüsü", "Anadolu Yakası"] },
      { no: 3, arrow: "↗", destinations: ["Mecidiyeköy Meydan", "Şişli"] },
      { no: 4, arrow: "↗", destinations: ["Kağıthane", "Sarıyer"] },
    ],
  },
  {
    id: "levent-kopru-girisi",
    name: "Levent — Akmerkez/Köprü Ayrımı",
    approach: "Levent merkez / Kanyon yönünden",
    lat: 41.082,
    lng: 29.014,
    warnMeters: 400,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Maslak", "Sarıyer", "İGA Havalimanı"] },
      { no: 2, arrow: "↑", destinations: ["Maslak Devam"] },
      { no: 3, arrow: "↗", destinations: ["FSM Köprüsü", "Anadolu Yakası"] },
    ],
  },
  {
    id: "4-levent-maslak",
    name: "4. Levent — Maslak Çıkışı",
    approach: "Büyükdere Caddesi kuzey yönü",
    lat: 41.105,
    lng: 29.022,
    warnMeters: 400,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Maslak Devam", "Sarıyer"] },
      { no: 2, arrow: "↑", destinations: ["İTÜ", "Ayazağa"] },
      { no: 3, arrow: "↗", destinations: ["Çevreyolu Çıkışı", "FSM/TEM"] },
    ],
  },
  {
    id: "hasdal",
    name: "Hasdal Kavşağı (TEM × O-7)",
    approach: "TEM Avrupa yönünden",
    lat: 41.107,
    lng: 28.827,
    warnMeters: 1000,
    matchRadius: 400,
    trap: "Kuzey Marmara Otoyolu (O-7) ve TEM (E-80) ayrımı 800 m kala başlar.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["TEM Devam", "Edirne", "Hadımköy"] },
      { no: 2, arrow: "↑", destinations: ["TEM Devam"] },
      { no: 3, arrow: "↗", destinations: ["O-7 Kuzey Marmara", "İGA Havalimanı", "YSS Köprüsü"] },
      { no: 4, arrow: "↗", destinations: ["O-7", "İGA Havalimanı"] },
    ],
  },
  {
    id: "mahmutbey-giseleri",
    name: "Mahmutbey TEM Gişeleri",
    approach: "İstanbul içi → Edirne/Ankara çıkışı",
    lat: 41.062,
    lng: 28.803,
    warnMeters: 700,
    matchRadius: 300,
    trap: "HGS'siz şeritlerden geçme — para cezası.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["HGS", "Yolcu Otobüsü"] },
      { no: 2, arrow: "↑", destinations: ["HGS"] },
      { no: 3, arrow: "↑", destinations: ["HGS", "Otomobil"] },
      { no: 4, arrow: "↑", destinations: ["HGS", "Otomobil"] },
    ],
  },
  {
    id: "bayrampasa",
    name: "Bayrampaşa Kavşağı",
    approach: "TEM Avrupa girişi yönünden",
    lat: 41.04,
    lng: 28.91,
    warnMeters: 600,
    matchRadius: 300,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["E-5 Devam", "Eminönü", "Aksaray"] },
      { no: 2, arrow: "↗", destinations: ["TEM Avrupa", "Edirne"] },
      { no: 3, arrow: "↗", destinations: ["TEM Anadolu", "Boğaziçi/FSM"] },
    ],
  },
  {
    id: "edirnekapi-o3",
    name: "Edirnekapı O-3 Sağ Çıkışı",
    approach: "O-3 doğu yönü — Edirnekapı çıkışı",
    lat: 41.027,
    lng: 28.926,
    warnMeters: 600,
    matchRadius: 250,
    trap: "5 şeritten sadece en sağ şerit çıkıyor.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["O-3 Devam", "Fatih"] },
      { no: 2, arrow: "↑", destinations: ["O-3 Devam"] },
      { no: 3, arrow: "↑", destinations: ["O-3 Devam"] },
      { no: 4, arrow: "↑", destinations: ["O-3 Devam"] },
      { no: 5, arrow: "↗", destinations: ["Edirnekapı Çıkışı", "Tarihi Yarımada"] },
    ],
  },
  {
    id: "cevizlibag",
    name: "Cevizlibağ Kavşağı",
    approach: "E-5 Avrupa yönünden",
    lat: 41.001,
    lng: 28.918,
    warnMeters: 500,
    matchRadius: 200,
    trap: "Sahil yoluna inmek için en sağ şerit gerek.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["E-5 Devam", "Topkapı", "Aksaray"] },
      { no: 2, arrow: "↑", destinations: ["E-5 Devam"] },
      { no: 3, arrow: "↗", destinations: ["Sahil Yolu", "Yenikapı Vapur", "Eminönü"] },
    ],
  },
  {
    id: "topkapi-bypass",
    name: "Topkapı Kavşağı",
    approach: "E-5 yönünden tarihi yarımadaya",
    lat: 41.013,
    lng: 28.93,
    warnMeters: 400,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["E-5 Devam", "Cevizlibağ"] },
      { no: 2, arrow: "↑", destinations: ["Sulukule", "Edirnekapı"] },
      { no: 3, arrow: "↗", destinations: ["Topkapı Otogarı", "Vatan Cd"] },
    ],
  },
  {
    id: "aksaray",
    name: "Aksaray Meydanı",
    approach: "Vatan Caddesi'nden geliş",
    lat: 41.012,
    lng: 28.952,
    warnMeters: 350,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sirkeci", "Sultanahmet"] },
      { no: 2, arrow: "↗", destinations: ["Yenikapı Vapur", "Sahil Yolu"] },
      { no: 3, arrow: "↗", destinations: ["Beyazıt", "Eminönü"] },
    ],
  },

  // =========================
  // SAHİL YOLU & YENİKAPI
  // =========================
  {
    id: "yenikapi-vapur",
    name: "Yenikapı Arabalı Vapur Girişi",
    approach: "Sahil Yolu Bakırköy yönünden",
    lat: 40.998,
    lng: 28.95,
    warnMeters: 400,
    matchRadius: 200,
    trap: "Vapur gişesine girmek için en sağ şerit; orta şerit sahile devam.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sahil Devam", "Yedikule", "Eminönü"] },
      { no: 2, arrow: "↑", destinations: ["Sahil Devam"] },
      { no: 3, arrow: "↗", destinations: ["Vapur Gişeleri", "Bandırma Bileti"] },
    ],
  },
  {
    id: "bakirkoy-sahil-e5",
    name: "Bakırköy — E-5 / Sahil Yolu Ayrımı",
    approach: "Yeşilköy/Florya yönünden",
    lat: 40.978,
    lng: 28.84,
    warnMeters: 500,
    matchRadius: 250,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sahil Yolu Devam", "Yedikule"] },
      { no: 2, arrow: "↖", destinations: ["E-5 Çevreyolu", "Bahçelievler"] },
      { no: 3, arrow: "↖", destinations: ["E-5 Çevreyolu", "Cevizlibağ"] },
    ],
  },
  {
    id: "florya",
    name: "Florya Sahil Sapağı",
    approach: "Sahil yolu Avcılar yönünden",
    lat: 40.978,
    lng: 28.78,
    warnMeters: 400,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sahil Devam", "Yeşilköy", "Bakırköy"] },
      { no: 2, arrow: "↗", destinations: ["Florya Plajları", "Atatürk Köşkü"] },
    ],
  },

  // =========================
  // EMİNÖNÜ - KARAKÖY - BEŞİKTAŞ SAHİLİ
  // =========================
  {
    id: "eminonu-galata",
    name: "Eminönü — Galata Köprüsü Girişi",
    approach: "Sirkeci/Hocapaşa yönünden",
    lat: 41.018,
    lng: 28.974,
    warnMeters: 250,
    matchRadius: 150,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Galata Köprüsü", "Karaköy"] },
      { no: 2, arrow: "↗", destinations: ["Eminönü Meydan", "Mısır Çarşısı"] },
    ],
  },
  {
    id: "karakoy",
    name: "Karaköy — Tünel/Tarlabaşı/Sahil Ayrımı",
    approach: "Galata Köprüsü çıkışı",
    lat: 41.024,
    lng: 28.978,
    warnMeters: 300,
    matchRadius: 150,
    lanes: [
      { no: 1, arrow: "↗", destinations: ["Tarlabaşı", "Taksim"] },
      { no: 2, arrow: "↑", destinations: ["Sahil Devam", "Kabataş", "Beşiktaş"] },
      { no: 3, arrow: "↗", destinations: ["Galata Köprüsü Üst", "Karaköy Meydan"] },
    ],
  },
  {
    id: "kabatas",
    name: "Kabataş Sahil",
    approach: "Karaköy yönünden Beşiktaş'a doğru",
    lat: 41.034,
    lng: 28.994,
    warnMeters: 300,
    matchRadius: 150,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sahil Devam", "Beşiktaş", "Ortaköy"] },
      { no: 2, arrow: "↗", destinations: ["Dolmabahçe Stadı", "Beşiktaş Meydan"] },
    ],
  },

  // =========================
  // ANADOLU YAKASI - SAHİL/D100
  // =========================
  {
    id: "uskudar-meydan",
    name: "Üsküdar Meydanı",
    approach: "Bağlarbaşı/Çamlıca yönünden",
    lat: 41.025,
    lng: 29.016,
    warnMeters: 300,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Sahil Devam", "Kadıköy"] },
      { no: 2, arrow: "↗", destinations: ["Üsküdar İskele", "Vapur"] },
      { no: 3, arrow: "↗", destinations: ["Selamsız", "Çamlıca"] },
    ],
  },
  {
    id: "kadikoy-iskele",
    name: "Kadıköy İskele Önü",
    approach: "Bağdat Caddesi'nden",
    lat: 40.992,
    lng: 29.022,
    warnMeters: 300,
    matchRadius: 150,
    trap: "Vapur iskelesine en sağ şerit; orta sahil/Marmaray.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["Marmaray", "Otogar Altgeçit"] },
      { no: 2, arrow: "↑", destinations: ["Moda", "Fenerbahçe"] },
      { no: 3, arrow: "↗", destinations: ["Kadıköy İskele", "Vapur"] },
    ],
  },
  {
    id: "bagdat-suadiye",
    name: "Bağdat Cd. Suadiye Sapağı",
    approach: "Bostancı yönünden — 2 şeritli yol",
    lat: 40.962,
    lng: 29.078,
    warnMeters: 250,
    matchRadius: 150,
    trap: "İki şerit ayrılır: sağ Bağdat'a devam, sol sahile iner.",
    lanes: [
      { no: 1, arrow: "↖", destinations: ["Sahil Yolu", "Fenerbahçe"] },
      { no: 2, arrow: "↑", destinations: ["Bağdat Cd Devam", "Erenköy"] },
    ],
  },
  {
    id: "maltepe-sahil",
    name: "Maltepe — D100 / Sahil Ayrımı",
    approach: "Kadıköy/Kartal yönünden",
    lat: 40.935,
    lng: 29.146,
    warnMeters: 500,
    matchRadius: 250,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["D-100 Devam", "Kartal", "Pendik"] },
      { no: 2, arrow: "↑", destinations: ["D-100 Devam"] },
      { no: 3, arrow: "↗", destinations: ["Sahil Devam", "Maltepe Sahil Parkı"] },
    ],
  },
  {
    id: "kartal-d100",
    name: "Kartal D100 Sapağı",
    approach: "Kartal merkezden geçiş",
    lat: 40.91,
    lng: 29.185,
    warnMeters: 400,
    matchRadius: 200,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["D-100 Devam", "Pendik"] },
      { no: 2, arrow: "↑", destinations: ["D-100 Devam"] },
      { no: 3, arrow: "↗", destinations: ["Kartal Meydan", "Sahil"] },
    ],
  },
  {
    id: "pendik-saw",
    name: "Pendik — Sabiha Gökçen Sapağı",
    approach: "D-100 Pendik yönünden",
    lat: 40.882,
    lng: 29.27,
    warnMeters: 800,
    matchRadius: 300,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["D-100 Devam", "Tuzla", "Gebze"] },
      { no: 2, arrow: "↑", destinations: ["D-100 Devam"] },
      { no: 3, arrow: "↗", destinations: ["Sabiha Gökçen Havalimanı"] },
    ],
  },
  {
    id: "camlica-tem",
    name: "Çamlıca TEM Kavşağı",
    approach: "Üsküdar/Acıbadem yönünden",
    lat: 41.018,
    lng: 29.075,
    warnMeters: 700,
    matchRadius: 300,
    trap: "TEM Avrupa (FSM) ve TEM Ankara ayrımı 500 m kala başlar.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["TEM Avrupa", "FSM Köprüsü"] },
      { no: 2, arrow: "↑", destinations: ["TEM Devam"] },
      { no: 3, arrow: "↗", destinations: ["TEM Ankara", "Kavacık", "Kartal"] },
    ],
  },
  {
    id: "kavacik-tem",
    name: "Kavacık TEM Girişi",
    approach: "FSM Köprüsü çıkışından",
    lat: 41.097,
    lng: 29.094,
    warnMeters: 500,
    matchRadius: 250,
    lanes: [
      { no: 1, arrow: "↑", destinations: ["TEM Anadolu Devam", "Çamlıca", "Ankara"] },
      { no: 2, arrow: "↑", destinations: ["TEM Devam"] },
      { no: 3, arrow: "↗", destinations: ["Kavacık Çıkışı", "Beykoz"] },
    ],
  },

  // =========================
  // HAVALİMANLARI
  // =========================
  {
    id: "iga-havalimani-sapagi",
    name: "İGA İstanbul Havalimanı Sapağı",
    approach: "O-7 Kuzey Marmara batı yönünden",
    lat: 41.265,
    lng: 28.75,
    warnMeters: 1500,
    matchRadius: 600,
    trap: "Yolcu çıkışı (Departures) için üst kat; karşılama için alt kat — son kavşakta ayrılır.",
    lanes: [
      { no: 1, arrow: "↑", destinations: ["O-7 Devam", "Edirne"] },
      { no: 2, arrow: "↗", destinations: ["İGA Havalimanı", "Yolcu Çıkış (Departures)"] },
      { no: 3, arrow: "↗", destinations: ["İGA Havalimanı", "Karşılama (Arrivals)"] },
    ],
  },
];

// İki nokta arası mesafe (metre)
function distanceM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
): number {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

// Verilen koordinata en yakın manuel kavşağı bul (matchRadius içinde)
export function matchManualJunction(
  lng: number,
  lat: number
): ManualJunction | null {
  let best: { j: ManualJunction; d: number } | null = null;
  for (const j of MANUAL_JUNCTIONS) {
    const d = distanceM({ lng, lat }, { lng: j.lng, lat: j.lat });
    if (d <= j.matchRadius && (!best || d < best.d)) {
      best = { j, d };
    }
  }
  return best?.j ?? null;
}
