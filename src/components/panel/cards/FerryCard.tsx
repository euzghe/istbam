"use client";

import { FERRIES, PASSENGER_SEABUS } from "@/data/ferries";

export function FerryCard() {
  const main = FERRIES[0]; // Gestaş Eskihisar-Topçular — tek gerçek hat

  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cini font-semibold">
            ⛴ Arabalı Vapur
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Aktif tek hat: {main.from} → {main.to}
          </h2>
          <p className="text-xs text-on-soft mt-1.5 leading-relaxed">
            {main.description}
          </p>
        </div>
        <span
          title="Anlık sefer saati / kuyruk için resmi API yok. Aşağıdaki Gestaş linkinden güncel tarifeye bak."
          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-mehtap/20 text-mehtap rounded-full px-2 py-0.5 ring-1 ring-mehtap/30"
        >
          Saat: resmi site
        </span>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Tile
          tone="good"
          kicker="Vapurla"
          big={`~${main.durationMin} dk`}
          sub="Operatör beyanı"
        />
        <Tile
          tone="warn"
          kicker="Karayolu"
          big={`~${main.roadAltMin} dk`}
          sub="Köprü/otoyol ile"
        />
      </div>

      <div className="mt-3 rounded-xl bg-card ring-1 ring-line px-3 py-2 text-xs text-on-soft">
        Vapur yaklaşık <strong className="text-cini">{main.roadAltMin - main.durationMin} dk</strong> kazandırır,
        ama kuyruk uzunluğu ve sefer aralığı değişebilir. <strong>Anlık saatler / kuyruk için Gestaş.</strong>
      </div>

      {/* Yolcu hatları — yanlış bilgiyle karıştırılmasın diye ayrı */}
      <div className="mt-4">
        <h3 className="text-[10px] uppercase tracking-widest text-on-mute font-bold mb-2">
          Yolcu deniz otobüsü (araç almaz)
        </h3>
        <ul className="space-y-1.5">
          {PASSENGER_SEABUS.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between rounded-xl bg-card ring-1 ring-line px-3 py-2"
            >
              <div className="min-w-0">
                <div className="text-sm text-on truncate">
                  {s.from} → {s.to}
                </div>
                <div className="text-[10px] text-on-mute truncate">
                  {s.operator} · sadece yolcu
                </div>
              </div>
              <a
                href={s.scheduleUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-semibold text-cini hover:text-vapur transition shrink-0"
              >
                Saat ↗
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="mt-4 rounded-xl bg-bogaz-deep text-sis/85 px-4 py-2.5 flex items-center justify-between gap-3 text-[11px]">
        <span className="text-sis/65">
          Anlık tarife: operatör resmi sayfası
        </span>
        <a
          href={main.scheduleUrl}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-vapur text-bogaz-deep font-semibold px-3 py-1.5 hover:bg-vapur-soft transition"
        >
          Gestaş sefer saatleri ↗
        </a>
      </footer>
    </section>
  );
}

function Tile({
  tone,
  kicker,
  big,
  sub,
}: {
  tone: "good" | "warn";
  kicker: string;
  big: string;
  sub: string;
}) {
  const ring =
    tone === "good"
      ? "ring-cini/30 bg-cini/8"
      : "ring-vapur-red/30 bg-vapur-red/8";
  const color = tone === "good" ? "text-cini" : "text-vapur-red";
  return (
    <div className={`rounded-xl ring-1 px-3 py-3 ${ring}`}>
      <div className="text-[10px] uppercase tracking-widest text-on-mute">
        {kicker}
      </div>
      <div className={`mt-1 font-display text-2xl font-semibold ${color}`}>
        {big}
      </div>
      <div className="text-[11px] text-on-soft mt-0.5">{sub}</div>
    </div>
  );
}
