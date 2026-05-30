// Şerit Rehberi — kritik kavşaklar.
// Lane numarası soldan sağa: 1 en sol.
export type Lane = {
  no: number;
  // bu şeritte gidersen nereye çıkarsın
  destinations: string[];
  // ana hedef türü (renk için)
  kind: "kopru-anadolu" | "kopru-avrupa" | "sahil" | "cevreyolu" | "havalimani" | "merkez" | "donus";
};

export type Junction = {
  id: string;
  name: string;
  approach: string; // hangi yönden gelen sürücü için
  lng: number;
  lat: number;
  // sürücüye uyarı ne zaman düşsün (metre)
  warnMeters: number;
  lanes: Lane[];
  // sık karıştırılan hedef
  trap?: string;
};

export const JUNCTIONS: Junction[] = [
  {
    id: "jct-15temmuz-girisi",
    name: "15 Temmuz Şehitler Köprüsü Girişi (Avrupa)",
    approach: "Beşiktaş–Ortaköy yönünden",
    lng: 29.034,
    lat: 41.045,
    warnMeters: 600,
    trap: "Köprüye geçmek için sağ değil, en sol şerit lazım.",
    lanes: [
      { no: 1, kind: "kopru-anadolu", destinations: ["15 Temmuz Köprüsü", "Anadolu Yakası", "Kadıköy"] },
      { no: 2, kind: "kopru-anadolu", destinations: ["15 Temmuz Köprüsü", "Üsküdar"] },
      { no: 3, kind: "sahil", destinations: ["Sahil Yolu Devam", "Kuruçeşme"] },
      { no: 4, kind: "donus", destinations: ["U Dönüşü", "Beşiktaş"] },
    ],
  },
  {
    id: "jct-fsm-girisi",
    name: "FSM Köprüsü Girişi (Avrupa - Hisarüstü)",
    approach: "Hisarüstü yönünden",
    lng: 29.057,
    lat: 41.083,
    warnMeters: 700,
    trap: "Çevreyolu ve Köprü ayrımı 200 m kala başlar.",
    lanes: [
      { no: 1, kind: "cevreyolu", destinations: ["Çevreyolu", "Maslak", "Hadımköy"] },
      { no: 2, kind: "kopru-anadolu", destinations: ["FSM Köprüsü", "Kavacık", "Anadolu"] },
      { no: 3, kind: "kopru-anadolu", destinations: ["FSM Köprüsü", "Kavacık"] },
      { no: 4, kind: "havalimani", destinations: ["Sabiha Gökçen", "TEM Devam"] },
    ],
  },
  {
    id: "jct-mecidiyekoy",
    name: "Mecidiyeköy Kavşağı",
    approach: "Şişli–Mecidiyeköy yönünden",
    lng: 28.999,
    lat: 41.067,
    warnMeters: 500,
    trap: "Boğaziçi Köprüsü ve TEM ayrımı çok geç işaretlenir.",
    lanes: [
      { no: 1, kind: "cevreyolu", destinations: ["E-5 Devam", "Zincirlikuyu"] },
      { no: 2, kind: "kopru-anadolu", destinations: ["Boğaziçi Köprüsü", "Anadolu Yakası"] },
      { no: 3, kind: "merkez", destinations: ["Levent", "Maslak"] },
      { no: 4, kind: "sahil", destinations: ["Kağıthane", "Sarıyer"] },
    ],
  },
  {
    id: "jct-sultanahmet-cikis",
    name: "Sultanahmet Çıkışı",
    approach: "Vatan Caddesi'nden Tarihi Yarımada'ya inen",
    lng: 28.977,
    lat: 41.008,
    warnMeters: 400,
    trap: "Otopark için sağ şerit gerek, vapur için orta.",
    lanes: [
      { no: 1, kind: "merkez", destinations: ["Sultanahmet İSPARK", "Ayasofya"] },
      { no: 2, kind: "sahil", destinations: ["Sahil Yolu", "Yenikapı Arabalı Vapur"] },
      { no: 3, kind: "kopru-avrupa", destinations: ["Atatürk Köprüsü", "Eminönü"] },
    ],
  },
  {
    id: "jct-yenikapi-vapur",
    name: "Yenikapı Arabalı Vapur Girişi",
    approach: "Sahil Yolu — Bakırköy yönünden",
    lng: 28.95,
    lat: 40.998,
    warnMeters: 350,
    trap: "Gişeye girmek için en sağ şerit; orta şerit sahile devam.",
    lanes: [
      { no: 1, kind: "merkez", destinations: ["Vapur Gişeleri", "Bandırma Bileti"] },
      { no: 2, kind: "sahil", destinations: ["Sahil Yolu Devam", "Eminönü"] },
      { no: 3, kind: "cevreyolu", destinations: ["E-5 Bağlantı", "Aksaray"] },
    ],
  },
  {
    id: "jct-kadikoy-iskele",
    name: "Kadıköy İskele Önü",
    approach: "Bağdat Caddesi'nden",
    lng: 29.022,
    lat: 40.992,
    warnMeters: 300,
    trap: "Vapur ve marmaray altyolu farklı şeritler.",
    lanes: [
      { no: 1, kind: "merkez", destinations: ["Otogar Altgeçit"] },
      { no: 2, kind: "sahil", destinations: ["Kadıköy Vapur İskele", "İSPARK"] },
      { no: 3, kind: "sahil", destinations: ["Moda", "Fenerbahçe"] },
    ],
  },
  {
    id: "jct-bagdat-suadiye",
    name: "Bağdat Cd. Suadiye Sapağı",
    approach: "Bostancı yönünden — 2 şeritli yol",
    lng: 29.078,
    lat: 40.962,
    warnMeters: 250,
    trap: "İki şerit ayrılır: sağ Bağdat'a devam, sol sahile iner.",
    lanes: [
      { no: 1, kind: "sahil", destinations: ["Sahil Yolu", "Fenerbahçe"] },
      { no: 2, kind: "merkez", destinations: ["Bağdat Cd. Devam", "Erenköy"] },
    ],
  },
  {
    id: "jct-edirnekapi-o3",
    name: "Edirnekapı O-3 Sağ Çıkış",
    approach: "O-3 doğu yönü — Edirnekapı çıkışı",
    lng: 28.926,
    lat: 41.027,
    warnMeters: 600,
    trap: "5 şeritten sadece en sağ şerit çıkıyor.",
    lanes: [
      { no: 1, kind: "cevreyolu", destinations: ["O-3 Devam"] },
      { no: 2, kind: "cevreyolu", destinations: ["O-3 Devam"] },
      { no: 3, kind: "cevreyolu", destinations: ["O-3 Devam"] },
      { no: 4, kind: "cevreyolu", destinations: ["O-3 Devam"] },
      { no: 5, kind: "merkez", destinations: ["Edirnekapı Çıkış"] },
    ],
  },
  {
    id: "jct-haramidere-tem",
    name: "Haramidere TEM Kavşağı",
    approach: "E-5 batı yönünden — 5 şeritli",
    lng: 28.685,
    lat: 41.013,
    warnMeters: 800,
    trap: "5 şeritte 5 farklı hedef — kararı 800m önce ver.",
    lanes: [
      { no: 1, kind: "donus", destinations: ["U Dönüş", "Avcılar"] },
      { no: 2, kind: "merkez", destinations: ["E-5 Devam", "Bakırköy"] },
      { no: 3, kind: "cevreyolu", destinations: ["TEM Kuzey", "Hadımköy"] },
      { no: 4, kind: "havalimani", destinations: ["İst. Havalimanı"] },
      { no: 5, kind: "sahil", destinations: ["Sahil Yolu", "Florya"] },
    ],
  },
];

export function laneColor(kind: Lane["kind"]) {
  switch (kind) {
    case "kopru-anadolu":
    case "kopru-avrupa":
      return "bg-cini";
    case "cevreyolu":
      return "bg-vapur";
    case "sahil":
      return "bg-mehtap";
    case "havalimani":
      return "bg-cini-soft";
    case "merkez":
      return "bg-vapur-red";
    case "donus":
      return "bg-ink-mute";
  }
}

export function laneLabel(kind: Lane["kind"]) {
  switch (kind) {
    case "kopru-anadolu":
      return "Köprü → Anadolu";
    case "kopru-avrupa":
      return "Köprü → Avrupa";
    case "cevreyolu":
      return "Çevreyolu";
    case "sahil":
      return "Sahil";
    case "havalimani":
      return "Havalimanı";
    case "merkez":
      return "Merkez/Hedef";
    case "donus":
      return "U Dönüş";
  }
}
