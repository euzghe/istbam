import Link from "next/link";
import { Logo } from "@/components/Logo";
import { IstanbulSilhouette } from "@/components/IstanbulSilhouette";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-canvas">
      <SiteNav />
      <Hero />
      <PainSection />
      <ModulesGrid />
      <DetailsSection />
      <CtaFooter />
      <SiteFooter />
    </div>
  );
}

function SiteNav() {
  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <nav className="mx-auto max-w-6xl flex items-center justify-between px-6 py-5">
        <Logo variant="light" size={28} />
        <div className="hidden sm:flex items-center gap-7 text-sm font-medium text-sis/90">
          <a href="#serit" className="hover:text-vapur transition">Şerit</a>
          <a href="#ispark" className="hover:text-vapur transition">İSPARK</a>
          <a href="#vapur" className="hover:text-vapur transition">Vapur</a>
          <a href="#detay" className="hover:text-vapur transition">Detay</a>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="light-bar" />
          <Link
            href="/panel"
            className="rounded-full bg-vapur text-bogaz-deep font-semibold text-sm px-4 py-2 hover:bg-vapur-soft transition"
          >
            Panele Git
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-bogaz text-sis">
      {/* Arkada İstanbul silüeti */}
      <div className="absolute inset-x-0 bottom-0 h-[55%] sm:h-[60%]">
        <IstanbulSilhouette className="w-full h-full" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-44 sm:pt-40 sm:pb-56">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-cini/15 ring-1 ring-cini/40 text-cini-soft text-xs font-medium px-3 py-1">
            <span className="size-1.5 rounded-full bg-cini animate-pulse" />
            İstanbul'da arabayla olanların yardımcısı
          </span>

          <h1 className="mt-6 font-display font-semibold tracking-tight text-5xl sm:text-7xl leading-[1.02]">
            Şehrin trafiği
            <br />
            <span className="text-vapur">seni kaybetmesin.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-sis/80 max-w-xl leading-relaxed">
            Şeritte hangi yön nereye gider, en yakın İSPARK boş mu, sonraki
            arabalı vapur ne zaman — hepsi tek bakışta.{" "}
            <span className="text-mehtap">
              Soracak kimse yok; site senin için biliyor.
            </span>
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link
              href="/panel"
              className="inline-flex items-center justify-center rounded-full bg-vapur text-bogaz-deep font-semibold px-6 py-3 hover:bg-vapur-soft transition shadow-lg shadow-bogaz-deep/40"
            >
              Yola çıkmadan aç →
            </Link>
            <a
              href="#serit"
              className="inline-flex items-center justify-center rounded-full ring-1 ring-sis/30 text-sis font-medium px-6 py-3 hover:bg-sis/10 transition"
            >
              Nasıl çalışır?
            </a>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-sis/60">
            <span className="flex items-center gap-1.5">
              <DotPulse /> Canlı trafik
            </span>
            <span className="flex items-center gap-1.5">
              <DotPulse /> Canlı İSPARK doluluk
            </span>
            <span className="flex items-center gap-1.5">
              <DotPulse /> Vapur saatleri
            </span>
            <span className="flex items-center gap-1.5">
              <DotPulse /> Sesli uyarı
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DotPulse() {
  return (
    <span className="relative flex size-2">
      <span className="absolute inline-flex h-full w-full rounded-full bg-cini opacity-60 animate-ping" />
      <span className="relative inline-flex size-2 rounded-full bg-cini" />
    </span>
  );
}

function PainSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold text-cini uppercase tracking-widest">
          Tanıdık geldi mi?
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-on max-w-3xl leading-tight">
          "Navigasyondan baktık ama hangi şeride geçeceğimizi anlayamadık.
          Çıkışı kaçırdık, yol bir saat uzadı."
        </h2>

        <div className="mt-12 grid sm:grid-cols-3 gap-6">
          <PainCard
            badge="Şerit kararı"
            title="Sağ bir yere, sol bir yere, orta bir yere…"
            text="4 şeritli yolda her şerit farklı bir noktaya çıkıyor. Navigasyondan da anlaşılmıyor. O an karar veremiyorsun, kaçırıyorsun."
          />
          <PainCard
            badge="İSPARK"
            title="Hangisi boş, ne kadar mesafede?"
            text="Eski Şehir'de tur atıyorsun, dolu olanı görüyorsun, boş olanı bilmiyorsun. Fiyatları da kıyaslayamıyorsun."
          />
          <PainCard
            badge="Vapur mu köprü mü?"
            title="Arabalı vapurun saatini kim bilir?"
            text="Yenikapı–Bandırma'ya kalkış var mı, Eskihisar kuyruğu ne kadar, köprüden mi daha hızlı — hepsi muamma."
          />
        </div>
      </div>
    </section>
  );
}

function PainCard({
  badge,
  title,
  text,
}: {
  badge: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-card bg-card p-6 ring-1 ring-line shadow-sm lift">
      <span className="inline-block text-xs font-semibold uppercase tracking-wider text-vapur-red bg-vapur-red/8 rounded-full px-2.5 py-1">
        {badge}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-on leading-snug">
        {title}
      </h3>
      <p className="mt-3 text-on-soft leading-relaxed">{text}</p>
    </div>
  );
}

function ModulesGrid() {
  return (
    <section className="bg-paper bg-card-2 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold text-cini uppercase tracking-widest">
              Tek panel, dört modül
            </p>
            <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-on max-w-2xl leading-tight">
              Direksiyondaki her sorunun cevabı burada.
            </h2>
          </div>
          <Link
            href="/panel"
            className="text-sm font-semibold text-bogaz hover:text-vapur-red transition"
          >
            Panele git →
          </Link>
        </div>

        <div id="serit" className="mt-12 grid lg:grid-cols-2 gap-6">
          <FeatureLarge
            number="01"
            kicker="En kritik özellik"
            title="Şerit Rehberi"
            text="500 metre öncesinden uyarı: 'Sağ şerit Boğaziçi Köprüsü, orta şerit FSM, sol şerit Çevreyolu — şu an orta şeritte ol.' Görsel tablo + sesli yönlendirme. Kaçırırsan plan B otomatik."
            chip="Sesli uyarı"
            visual={<SeritVisual />}
          />
          <FeatureLarge
            id="ispark"
            number="02"
            kicker="En kritik özellik"
            title="İSPARK Bul"
            text="Hedefine 500m kala yakındaki 3 İSPARK: canlı doluluk, fiyat, yürüme mesafesi. Dolu olana boşuna gitme. Park ettiğin yeri otomatik kaydet, geri dönüşte unutma."
            chip="Canlı doluluk"
            visual={<IsparkVisual />}
          />
        </div>

        <div id="vapur" className="mt-6 grid lg:grid-cols-2 gap-6">
          <FeatureSmall
            number="03"
            title="Arabalı Vapur"
            text="Yenikapı–Bandırma, Eskihisar–Topçular, Pendik–Yalova. Sonraki sefer, tahmini kuyruk, 'köprüden mi vapurdan mı hızlı' karşılaştırması."
            visual={<VapurVisual />}
          />
          <FeatureSmall
            number="04"
            title="Trafik & Yol Durumu"
            text="Boğaziçi mi FSM mi Yavuz Sultan Selim mi şu an açık? Kapanan yol, kaza, çalışma — alternatif rota anında."
            visual={<TrafikVisual />}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureLarge({
  id,
  number,
  kicker,
  title,
  text,
  chip,
  visual,
}: {
  id?: string;
  number: string;
  kicker: string;
  title: string;
  text: string;
  chip: string;
  visual: React.ReactNode;
}) {
  return (
    <article
      id={id}
      className="rounded-card overflow-hidden bg-bogaz text-sis ring-1 ring-bogaz-deep/40 lift"
    >
      <div className="p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-cini-soft">{number}</span>
          <span className="text-xs font-semibold bg-vapur text-bogaz-deep rounded-full px-2.5 py-1">
            {chip}
          </span>
        </div>
        <p className="mt-5 text-xs font-semibold text-vapur uppercase tracking-widest">
          {kicker}
        </p>
        <h3 className="mt-2 font-display text-3xl font-semibold leading-tight">
          {title}
        </h3>
        <p className="mt-3 text-sis/80 leading-relaxed">{text}</p>
      </div>
      <div className="bg-bogaz-deep/60 px-7 pb-7 sm:px-9">{visual}</div>
    </article>
  );
}

function FeatureSmall({
  number,
  title,
  text,
  visual,
}: {
  number: string;
  title: string;
  text: string;
  visual: React.ReactNode;
}) {
  return (
    <article className="rounded-card bg-card ring-1 ring-line p-7 lift">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-on-mute">{number}</span>
      </div>
      <h3 className="mt-3 font-display text-2xl font-semibold text-on leading-tight">
        {title}
      </h3>
      <p className="mt-2 text-on-soft leading-relaxed">{text}</p>
      <div className="mt-5">{visual}</div>
    </article>
  );
}

// ---------- Görseller (mini ön-izleme) ----------

function SeritVisual() {
  const lanes = [
    { id: 1, lbl: "Boğaziçi K.", color: "bg-cini" },
    { id: 2, lbl: "FSM", color: "bg-vapur" },
    { id: 3, lbl: "Çevreyolu", color: "bg-vapur-red" },
  ];
  return (
    <div className="rounded-xl bg-bogaz-deep/70 p-4 ring-1 ring-cini/20">
      <div className="text-[10px] uppercase tracking-widest text-cini-soft">
        500 m sonra
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {lanes.map((l) => (
          <div
            key={l.id}
            className="rounded-lg bg-sis/5 ring-1 ring-sis/10 px-3 py-3"
          >
            <div className={`h-1.5 rounded-full ${l.color}`} />
            <div className="mt-2 text-xs text-sis/90 font-medium">{l.lbl}</div>
            <div className="text-[10px] text-sis/50">Şerit {l.id}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs text-vapur">
        <span className="inline-block size-2 rounded-full bg-vapur" />
        Hedefin için: <strong className="text-vapur">orta şeritte ol</strong>
      </div>
    </div>
  );
}

function IsparkVisual() {
  const list = [
    { name: "Beyazıt İSPARK", dist: "190 m", full: 62 },
    { name: "Sultanahmet İSPARK", dist: "420 m", full: 91 },
    { name: "Eminönü Otopark", dist: "650 m", full: 38 },
  ];
  return (
    <div className="rounded-xl bg-bogaz-deep/70 p-4 ring-1 ring-cini/20 space-y-2">
      {list.map((p) => {
        const color =
          p.full < 60
            ? "bg-cini"
            : p.full < 85
            ? "bg-vapur"
            : "bg-vapur-red";
        return (
          <div
            key={p.name}
            className="flex items-center justify-between gap-3 rounded-lg bg-sis/5 ring-1 ring-sis/10 px-3 py-2.5"
          >
            <div>
              <div className="text-sm text-sis font-medium">{p.name}</div>
              <div className="text-[11px] text-sis/50">{p.dist} • {100 - p.full}% boş</div>
            </div>
            <div className="w-24">
              <div className="h-1.5 rounded-full bg-sis/10 overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: `${p.full}%` }} />
              </div>
              <div className="text-[10px] text-sis/60 mt-1 text-right">%{p.full} dolu</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VapurVisual() {
  return (
    <div className="rounded-xl bg-chip ring-1 ring-line p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-on-mute">
            Yenikapı → Bandırma
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-on">
            16:00
          </div>
          <div className="text-xs text-on-soft">
            Kuyruk: ~12 araç • 1 sa 47 dk
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-on-mute">
            Köprü ile
          </div>
          <div className="mt-1 font-display text-2xl font-semibold text-vapur-red">
            +38 dk
          </div>
          <div className="text-xs text-cini font-semibold">Vapur kazanır</div>
        </div>
      </div>
    </div>
  );
}

function TrafikVisual() {
  const roads = [
    { name: "Boğaziçi Köprüsü", lvl: 78 },
    { name: "FSM Köprüsü", lvl: 54 },
    { name: "YSS Köprüsü", lvl: 31 },
  ];
  return (
    <div className="rounded-xl bg-chip ring-1 ring-line p-4 space-y-2">
      {roads.map((r) => {
        const c =
          r.lvl < 40 ? "bg-cini" : r.lvl < 70 ? "bg-vapur" : "bg-vapur-red";
        return (
          <div key={r.name} className="flex items-center gap-3">
            <div className="text-xs text-on-soft w-36">{r.name}</div>
            <div className="flex-1 h-1.5 rounded-full bg-line">
              <div className={`h-full rounded-full ${c}`} style={{ width: `${r.lvl}%` }} />
            </div>
            <div className="text-[11px] text-on-mute w-8 text-right">%{r.lvl}</div>
          </div>
        );
      })}
    </div>
  );
}

function DetailsSection() {
  const details = [
    {
      t: "Sesli yönlendirme",
      d: "Telefona dokunmadan dinle. Türkçe, doğal aksan.",
    },
    {
      t: "Park ettim, unuttum",
      d: "Park edince konumu otomatik kaydet. Geri dönüşte 'Arabama' tek tuş.",
    },
    {
      t: "HGS bakiye + ücret",
      d: "Hangi köprü/otoyolda ne kadar düşer, anlık göster.",
    },
    {
      t: "Akaryakıt karşılaştırma",
      d: "Rota üstündeki istasyonlar, anlık fiyat, en ucuz.",
    },
    {
      t: "Gece modu",
      d: "Karanlıkta gözü yormayan kontrast. Boğaz lacivertiyle.",
    },
    {
      t: "Çevrimdışı çekirdek",
      d: "Tünelde bile son şerit verisi, son İSPARK durumu elinde.",
    },
    {
      t: "Çekici & yardım",
      d: "Lastik patladı, motor ısındı — en yakın yardım tek tuş.",
    },
    {
      t: "Kaza tutanağı",
      d: "Adım adım rehber, fotoğraf çek, tutanağı paylaş.",
    },
  ];
  return (
    <section id="detay" className="bg-canvas py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <p className="text-sm font-semibold text-cini uppercase tracking-widest">
          Her ayrıntı düşünüldü
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl font-semibold text-on max-w-2xl leading-tight">
          Bir sürücünün gün boyunca yaşadığı her şey.
        </h2>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {details.map((x) => (
            <div
              key={x.t}
              className="rounded-card bg-card ring-1 ring-line p-5 lift"
            >
              <h3 className="font-display text-base font-semibold text-on">
                {x.t}
              </h3>
              <p className="mt-1.5 text-sm text-on-soft leading-relaxed">
                {x.d}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="bg-cini-pattern py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="font-display text-3xl sm:text-5xl font-semibold text-sis leading-tight">
          Yola çıkmadan önce <span className="text-vapur">İstbam'ı</span> aç.
        </h2>
        <p className="mt-4 text-sis/80 max-w-xl mx-auto">
          Şerit, otopark, vapur, trafik — telefonun seninle konuşsun, gözün yolda kalsın.
        </p>
        <Link
          href="/panel"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-vapur text-bogaz-deep font-semibold px-7 py-3.5 hover:bg-vapur-soft transition shadow-xl shadow-bogaz-deep/40"
        >
          Panele Git →
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-bogaz-deep text-sis/70 py-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="light" size={22} />
          <span className="text-xs text-sis/50">
            İstanbul'da arabayla olanlar için.
          </span>
        </div>
        <div className="text-xs text-sis/50">
          © {new Date().getFullYear()} İstbam · Yapım aşamasında
        </div>
      </div>
    </footer>
  );
}
