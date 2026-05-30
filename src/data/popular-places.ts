// İstanbul popüler aranan yerler — Nominatim'den önce hızlıca filtre için.
// Yerel statik, lokal arama; anında filtre eder.

export type PopularPlace = {
  label: string;
  alt?: string[]; // alternatif anahtar kelimeler ("besiktas", "bjk" vs.)
  lng: number;
  lat: number;
  kind: "ilce" | "mahalle" | "landmark" | "ulasim";
};

export const POPULAR_PLACES: PopularPlace[] = [
  // Anadolu yakası ilçeler
  { label: "Kadıköy", lng: 29.025, lat: 40.984, kind: "ilce" },
  { label: "Üsküdar", lng: 29.016, lat: 41.022, kind: "ilce" },
  { label: "Beykoz", lng: 29.0921, lat: 41.1239, kind: "ilce" },
  { label: "Ataşehir", lng: 29.116, lat: 40.985, kind: "ilce" },
  { label: "Maltepe", lng: 29.146, lat: 40.935, kind: "ilce" },
  { label: "Kartal", lng: 29.185, lat: 40.91, kind: "ilce" },
  { label: "Pendik", lng: 29.232, lat: 40.876, kind: "ilce" },
  { label: "Tuzla", lng: 29.299, lat: 40.815, kind: "ilce" },
  { label: "Ümraniye", lng: 29.099, lat: 41.016, kind: "ilce" },
  { label: "Sancaktepe", lng: 29.227, lat: 41.001, kind: "ilce" },
  { label: "Çekmeköy", lng: 29.193, lat: 41.038, kind: "ilce" },
  { label: "Şile", lng: 29.612, lat: 41.176, kind: "ilce" },

  // Avrupa yakası ilçeler
  { label: "Beşiktaş", alt: ["besiktas", "bjk"], lng: 29.007, lat: 41.043, kind: "ilce" },
  { label: "Beyoğlu", alt: ["beyoglu"], lng: 28.978, lat: 41.034, kind: "ilce" },
  { label: "Şişli", alt: ["sisli"], lng: 28.987, lat: 41.06, kind: "ilce" },
  { label: "Fatih", lng: 28.95, lat: 41.018, kind: "ilce" },
  { label: "Sarıyer", alt: ["sariyer"], lng: 29.035, lat: 41.171, kind: "ilce" },
  { label: "Bakırköy", alt: ["bakirkoy"], lng: 28.872, lat: 40.98, kind: "ilce" },
  { label: "Bahçelievler", lng: 28.86, lat: 41.0, kind: "ilce" },
  { label: "Bağcılar", lng: 28.857, lat: 41.034, kind: "ilce" },
  { label: "Esenler", lng: 28.886, lat: 41.044, kind: "ilce" },
  { label: "Güngören", lng: 28.872, lat: 41.018, kind: "ilce" },
  { label: "Zeytinburnu", lng: 28.901, lat: 41.0, kind: "ilce" },
  { label: "Avcılar", lng: 28.726, lat: 41.026, kind: "ilce" },
  { label: "Beylikdüzü", lng: 28.65, lat: 41.0, kind: "ilce" },
  { label: "Esenyurt", lng: 28.683, lat: 41.034, kind: "ilce" },
  { label: "Küçükçekmece", lng: 28.787, lat: 41.0, kind: "ilce" },
  { label: "Büyükçekmece", lng: 28.575, lat: 41.018, kind: "ilce" },
  { label: "Silivri", lng: 28.247, lat: 41.075, kind: "ilce" },
  { label: "Çatalca", lng: 28.46, lat: 41.144, kind: "ilce" },
  { label: "Arnavutköy", lng: 28.733, lat: 41.184, kind: "ilce" },
  { label: "Eyüp", lng: 28.934, lat: 41.046, kind: "ilce" },
  { label: "Gaziosmanpaşa", lng: 28.911, lat: 41.063, kind: "ilce" },
  { label: "Sultangazi", lng: 28.876, lat: 41.107, kind: "ilce" },
  { label: "Kağıthane", lng: 28.97, lat: 41.085, kind: "ilce" },
  { label: "Bayrampaşa", lng: 28.91, lat: 41.04, kind: "ilce" },

  // Mahalleler / popüler bölgeler — Anadolu
  { label: "Caddebostan", lng: 29.063, lat: 40.965, kind: "mahalle" },
  { label: "Suadiye", lng: 29.078, lat: 40.962, kind: "mahalle" },
  { label: "Bostancı", lng: 29.094, lat: 40.953, kind: "mahalle" },
  { label: "Erenköy", lng: 29.07, lat: 40.972, kind: "mahalle" },
  { label: "Fenerbahçe", lng: 29.035, lat: 40.969, kind: "mahalle" },
  { label: "Moda", lng: 29.024, lat: 40.98, kind: "mahalle" },
  { label: "Acıbadem", lng: 29.055, lat: 41.0, kind: "mahalle" },
  { label: "Göztepe", lng: 29.06, lat: 40.978, kind: "mahalle" },
  { label: "Bağdat Caddesi", lng: 29.05, lat: 40.97, kind: "mahalle" },
  { label: "Kozyatağı", lng: 29.097, lat: 40.98, kind: "mahalle" },

  // Mahalleler / popüler — Avrupa
  { label: "Sultanahmet", lng: 28.977, lat: 41.0058, kind: "landmark" },
  { label: "Eminönü", lng: 28.97, lat: 41.017, kind: "mahalle" },
  { label: "Taksim", lng: 28.985, lat: 41.037, kind: "landmark" },
  { label: "Galata", lng: 28.974, lat: 41.026, kind: "landmark" },
  { label: "Karaköy", lng: 28.977, lat: 41.025, kind: "mahalle" },
  { label: "Mecidiyeköy", lng: 28.999, lat: 41.067, kind: "mahalle" },
  { label: "Levent", lng: 29.014, lat: 41.082, kind: "mahalle" },
  { label: "Maslak", lng: 29.022, lat: 41.108, kind: "mahalle" },
  { label: "Etiler", lng: 29.029, lat: 41.077, kind: "mahalle" },
  { label: "Bebek", lng: 29.043, lat: 41.077, kind: "mahalle" },
  { label: "Ortaköy", lng: 29.027, lat: 41.054, kind: "mahalle" },
  { label: "Beyazıt", lng: 28.964, lat: 41.011, kind: "mahalle" },
  { label: "Florya", lng: 28.78, lat: 40.978, kind: "mahalle" },
  { label: "Yeşilköy", lng: 28.82, lat: 40.962, kind: "mahalle" },

  // Ulaşım
  { label: "İstanbul Havalimanı (İGA)", alt: ["iga", "havalimani", "ist"], lng: 28.747, lat: 41.275, kind: "ulasim" },
  { label: "Sabiha Gökçen Havalimanı", alt: ["sabiha", "saw"], lng: 29.31, lat: 40.898, kind: "ulasim" },
  { label: "Yenikapı Arabalı Vapur", lng: 28.95, lat: 40.998, kind: "ulasim" },
  { label: "Kadıköy İskele", lng: 29.0247, lat: 40.9923, kind: "ulasim" },
  { label: "Eskihisar Arabalı Vapur", lng: 29.405, lat: 40.768, kind: "ulasim" },
  { label: "Halkalı (Marmaray)", lng: 28.787, lat: 41.034, kind: "ulasim" },

  // Landmark / önemli yerler
  { label: "15 Temmuz Köprüsü", lng: 29.034, lat: 41.045, kind: "landmark" },
  { label: "FSM Köprüsü", lng: 29.057, lat: 41.083, kind: "landmark" },
  { label: "YSS Köprüsü", lng: 29.107, lat: 41.197, kind: "landmark" },
  { label: "Avrasya Tüneli", lng: 28.98, lat: 41.0, kind: "landmark" },
  { label: "Kız Kulesi", lng: 29.004, lat: 41.021, kind: "landmark" },
  { label: "Galata Kulesi", lng: 28.974, lat: 41.026, kind: "landmark" },
  { label: "Ayasofya", lng: 28.98, lat: 41.0086, kind: "landmark" },
  { label: "Topkapı Sarayı", lng: 28.984, lat: 41.012, kind: "landmark" },
  { label: "Dolmabahçe Sarayı", lng: 29.0, lat: 41.039, kind: "landmark" },
  { label: "Eyüp Sultan Camii", lng: 28.93, lat: 41.048, kind: "landmark" },
  { label: "Süleymaniye Camii", lng: 28.964, lat: 41.016, kind: "landmark" },
  { label: "İstinye Park", lng: 29.054, lat: 41.117, kind: "landmark" },
  { label: "Kanyon AVM", lng: 29.013, lat: 41.083, kind: "landmark" },
  { label: "Cevahir AVM", lng: 28.989, lat: 41.066, kind: "landmark" },
  { label: "Forum İstanbul", lng: 28.917, lat: 41.04, kind: "landmark" },
  { label: "Mall of İstanbul", lng: 28.81, lat: 41.078, kind: "landmark" },
  { label: "Akmerkez", lng: 29.026, lat: 41.077, kind: "landmark" },
  { label: "Boğaziçi Üniversitesi", alt: ["bogazici", "boun"], lng: 29.052, lat: 41.085, kind: "landmark" },
  { label: "İTÜ Ayazağa Kampüsü", alt: ["itu", "ayazaga"], lng: 29.025, lat: 41.105, kind: "landmark" },
  { label: "Marmara Üniversitesi", alt: ["marmara"], lng: 29.103, lat: 40.987, kind: "landmark" },
];

function normalize(s: string) {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

export function searchPopular(query: string, limit = 6): PopularPlace[] {
  const q = normalize(query);
  if (q.length < 1) return [];
  const hits: { p: PopularPlace; score: number }[] = [];
  for (const p of POPULAR_PLACES) {
    const labelN = normalize(p.label);
    const altN = (p.alt ?? []).map(normalize);
    let score = -1;
    if (labelN.startsWith(q)) score = 100;
    else if (labelN.includes(" " + q)) score = 80;
    else if (altN.some((a) => a.startsWith(q))) score = 70;
    else if (labelN.includes(q)) score = 50;
    else if (altN.some((a) => a.includes(q))) score = 40;
    if (score > 0) hits.push({ p, score });
  }
  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, limit).map((x) => x.p);
}
