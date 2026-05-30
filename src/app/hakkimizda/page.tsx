import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IstanbulSilhouette } from "@/components/IstanbulSilhouette";

export const metadata = {
  title: "Hakkımızda — İstbam",
  description:
    "İstbam ne işe yarar, veriler nereden gelir, gizlilik nasıl, kim yapıyor — şeffaf açıklama.",
};

export default function Page() {
  return (
    <div className="flex flex-col flex-1 bg-canvas">
      {/* Hero */}
      <header className="relative overflow-hidden bg-bogaz text-sis">
        <div className="absolute inset-x-0 bottom-0 h-[50%] sm:h-[55%]">
          <IstanbulSilhouette className="w-full h-full" />
        </div>
        <nav className="absolute top-0 left-0 right-0 z-30">
          <div className="mx-auto max-w-5xl flex items-center justify-between px-6 py-5">
            <Link href="/">
              <Logo variant="light" size={28} />
            </Link>
            <Link
              href="/panel"
              className="rounded-full bg-vapur text-bogaz-deep font-semibold text-sm px-4 py-2 hover:bg-vapur-soft transition"
            >
              Panele Git
            </Link>
          </div>
        </nav>
        <div className="relative mx-auto max-w-5xl px-6 pt-32 pb-32 sm:pt-40 sm:pb-40">
          <span className="inline-flex items-center gap-2 rounded-full bg-cini/15 ring-1 ring-cini/40 text-cini-soft text-xs font-medium px-3 py-1">
            <span className="size-1.5 rounded-full bg-cini animate-pulse" />
            Hakkımızda
          </span>
          <h1 className="mt-6 font-display font-semibold tracking-tight text-4xl sm:text-6xl leading-[1.05]">
            İstanbul&apos;da arabayla olanlar için,{" "}
            <span className="text-vapur">açık verilerle.</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-sis/80 max-w-2xl leading-relaxed">
            İstbam, sürücünün direksiyonda kaybolmaması için yapılmış bir
            yardımcı. Şerit kararı, otopark, trafik, yakıt, HGS, yardım —
            hepsini İBB ve OpenStreetMap gibi açık kaynaklardan canlı çekiyor.
          </p>
        </div>
      </header>

      {/* Misyon */}
      <section className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold text-cini uppercase tracking-widest">
            Misyon
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-semibold text-on leading-tight">
            Şehir aramak için durmak zorunda olmamalısın.
          </h2>
          <p className="mt-5 text-on-soft leading-relaxed">
            İstbam, hangi şeritte olman gerektiğini söyler, en yakın boş
            İSPARK&apos;ı gösterir, hedefe rotayı çıkarır, trafik etkili varış
            süresini söyler, HGS toplamını hesaplar. Tek bir panelde, açık
            kaynak verilerle, gizliliğine saygılı şekilde.
          </p>
        </div>
      </section>

      {/* Veri kaynakları */}
      <section className="bg-canvas-rich py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold text-cini uppercase tracking-widest">
            Veri kaynakları
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-semibold text-on leading-tight">
            Hepsi açık, hepsi doğrulanabilir.
          </h2>
          <ul className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SOURCES.map((s) => (
              <li
                key={s.title}
                className="rounded-2xl bg-card ring-1 ring-line shadow-sm p-4"
              >
                <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-bold">
                  {s.tag}
                </div>
                <h3 className="mt-2 font-display text-lg font-semibold text-on leading-tight">
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm text-on-soft leading-relaxed">
                  {s.desc}
                </p>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-xs font-semibold text-cini hover:text-vapur transition"
                >
                  Kaynak ↗
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Gizlilik */}
      <section className="bg-canvas py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold text-cini uppercase tracking-widest">
            Gizlilik
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-semibold text-on leading-tight">
            Konumun bizde değil. Hesap istemiyoruz.
          </h2>
          <div className="mt-6 space-y-3">
            {PRIVACY.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-card ring-1 ring-line shadow-sm px-4 py-3"
              >
                <h3 className="font-display text-base font-semibold text-on leading-tight">
                  {p.title}
                </h3>
                <p className="mt-1 text-sm text-on-soft leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Kim */}
      <section className="bg-canvas-rich py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-6">
          <p className="text-sm font-semibold text-cini uppercase tracking-widest">
            Yapan
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-4xl font-semibold text-on leading-tight">
            Özge Altınok
          </h2>
          <p className="mt-5 text-on-soft leading-relaxed">
            Çankaya Üniversitesi Bilgisayar Mühendisliği öğrencisi. Bir gün
            arabayla İstanbul&apos;da 1 saat fazladan tur attıktan sonra
            yola çıktım — şerit kararı, İSPARK, vapur saatleri, hepsi tek
            yerde olsun istedim. İstbam bu sıkıntıdan doğdu.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <a
              href="https://github.com/euzghe/istbam"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-bogaz-deep text-sis font-semibold text-sm px-4 py-2 hover:bg-bogaz transition"
            >
              GitHub ↗
            </a>
            <a
              href="https://github.com/euzghe/istbam/blob/main/README.md"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-card ring-1 ring-line text-on font-semibold text-sm px-4 py-2 hover:bg-chip transition"
            >
              README
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-cini-pattern py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-display text-2xl sm:text-4xl font-semibold text-sis leading-tight">
            Yola çıkmadan önce <span className="text-vapur">İstbam&apos;ı</span>{" "}
            aç.
          </h2>
          <Link
            href="/panel"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-vapur text-bogaz-deep font-semibold px-6 py-3 hover:bg-vapur-soft transition shadow-xl shadow-bogaz-deep/40"
          >
            Panele Git →
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

const SOURCES = [
  {
    tag: "İBB Açık API",
    title: "İSPARK · 258 otopark canlı",
    desc: "Doluluk, tarife, çalışma saatleri her dakika güncellenir. İBB'nin resmi API'sından çekiyoruz.",
    url: "https://api.ibb.gov.tr/ispark/Park",
  },
  {
    tag: "İBB TKM",
    title: "Trafik İndeksi · 5 dk aralık",
    desc: "İBB Trafik Yönetim Merkezi'nin yayımladığı şehir geneli yoğunluk skoru. Canlı.",
    url: "https://api.ibb.gov.tr/tkmservices/api/TrafficData/v1/TrafficIndexHistory/1/5M",
  },
  {
    tag: "OpenStreetMap",
    title: "Şerit + POI + adres",
    desc: "Overpass API ile turn:lanes etiketi, hastane/eczane/AVM/EV-şarj POI'leri ve Nominatim ile adres araması.",
    url: "https://www.openstreetmap.org/",
  },
  {
    tag: "OSRM Open Source",
    title: "Adım-adım navigasyon",
    desc: "Tüm rota hesaplamaları project-osrm.org public demo'su üzerinden. Gerçek karayolu çizgisi.",
    url: "https://project-osrm.org/",
  },
  {
    tag: "Petrol Ofisi",
    title: "Akaryakıt fiyatları",
    desc: "PO'nun günlük yayımladığı İstanbul Avrupa/Anadolu fiyatları 6 saatte bir çekilir.",
    url: "https://www.petrolofisi.com.tr/akaryakit-fiyatlari",
  },
  {
    tag: "KGM + Operatör",
    title: "Köprü ve HGS tarifesi",
    desc: "15 Temmuz, FSM, YSS, Avrasya Tüneli, Osmangazi, Çanakkale ücretleri 2026 yılı tarifesi.",
    url: "https://www.kgm.gov.tr",
  },
];

const PRIVACY = [
  {
    title: "Konum verisi sadece tarayıcında",
    desc: "GPS konumun (geolocation) sadece tarayıcıda kullanılır. Sunucumuza GÖNDERİLMEZ. Yön çıkarmak için sadece kalkış-varış koordinatları OSRM'ye gider, kişiselleştirme veya kayıt yapılmaz.",
  },
  {
    title: "Kayıtlar localStorage'da",
    desc: "Favori adreslerin, park ettiğin yer, kasko numaran, HGS geçişlerin yalnızca cihazın yerel hafızasında. Tarayıcıyı kapatınca cihazda kalır, biz görmüyoruz.",
  },
  {
    title: "Çerez ve takip yok",
    desc: "Reklam çerezi, analytics takip pikseli, üçüncü taraf script yok. Bu sayfa Vercel'de barınır, sadece statik dosya servis eder.",
  },
  {
    title: "Açık kaynak",
    desc: "Tüm kod GitHub'da, MIT lisansı. Kim ne yapıyor görmek istersen kaynağa bak.",
  },
];

function SiteFooter() {
  return (
    <footer className="bg-bogaz-deep text-sis/70 py-10">
      <div className="mx-auto max-w-5xl px-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <Logo variant="light" size={22} />
          <p className="mt-3 text-xs text-sis/60 leading-relaxed">
            İstanbul&apos;da arabayla olanlar için açık veri tabanlı yardımcı.
          </p>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-vapur font-bold mb-2">
            Hızlı
          </div>
          <ul className="space-y-1.5 text-sm">
            <li>
              <Link href="/" className="hover:text-vapur transition">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link href="/panel" className="hover:text-vapur transition">
                Sürücü Paneli
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-vapur transition">
                Hakkımızda
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-widest text-vapur font-bold mb-2">
            Kaynak
          </div>
          <ul className="space-y-1.5 text-sm">
            <li>
              <a
                href="https://github.com/euzghe/istbam"
                target="_blank"
                rel="noreferrer"
                className="hover:text-vapur transition"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://github.com/euzghe/istbam/blob/main/README.md"
                target="_blank"
                rel="noreferrer"
                className="hover:text-vapur transition"
              >
                README
              </a>
            </li>
            <li>
              <a
                href="https://github.com/euzghe/istbam/blob/main/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="hover:text-vapur transition"
              >
                MIT Lisansı
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 mx-auto max-w-5xl px-6 text-[11px] text-sis/45 flex flex-wrap items-center justify-between gap-2 border-t border-sis/10 pt-4">
        <span>© {new Date().getFullYear()} İstbam · Özge Altınok</span>
        <span className="font-mono">istbam.vercel.app</span>
      </div>
    </footer>
  );
}
