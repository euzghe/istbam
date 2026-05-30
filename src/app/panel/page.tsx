"use client";

import Link from "next/link";
import { PageHeader } from "@/components/panel/sections/PageHeader";
import { CityPulseCard } from "@/components/panel/sections/CityPulseCard";
import { BogazCrossingCard } from "@/components/panel/sections/BogazCrossingCard";
import { FavoritesQuick } from "@/components/panel/sections/FavoritesQuick";
import { InstallAppCard } from "@/components/panel/sections/InstallAppCard";

// Ana sayfa hızlı erişim kartları — sürücünün en sık ihtiyaç duydukları.
const QUICK = [
  { href: "/panel/serit-rehberi", icon: "🧭", label: "Şerit Rehberi", hint: "Yaklaşan kavşak" },
  { href: "/panel/trafik", icon: "🚦", label: "Trafik Haritası", hint: "Yandex canlı" },
  { href: "/panel/ispark", icon: "🅿", label: "İSPARK", hint: "Canlı doluluk" },
  { href: "/panel/vapur", icon: "⛴", label: "Vapur", hint: "Arabalı + şehir hatları" },
  { href: "/panel/akaryakit", icon: "⛽", label: "Akaryakıt", hint: "Fiyat + istasyon" },
  { href: "/panel/arabam", icon: "🚗", label: "Arabam", hint: "Park ettiğim yer" },
];

export default function AnaSayfa() {
  return (
    <>
      <PageHeader
        icon="🩺"
        eyebrow="Ana sayfa"
        title="Şehrin Nabzı"
        description="İstanbul şu an nasıl? Trafik, hava, köprü, İSPARK, yakıt — tek bakışta gerçek veri."
        accent="vapur"
      />

      <InstallAppCard />

      <div className="animate-fade-in-up">
        <CityPulseCard />
      </div>

      <div className="animate-fade-in-up delay-1">
        <BogazCrossingCard />
      </div>

      <section className="animate-fade-in-up delay-2 rounded-card border border-line bg-card overflow-hidden">
        <header className="px-5 pt-4 pb-2">
          <div className="text-[10px] uppercase tracking-widest text-cini-soft font-semibold">
            Hızlı erişim
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold">
            Nereye gidiyorsun?
          </h2>
        </header>
        <div className="px-5 pb-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {QUICK.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="rounded-xl bg-sis/5 ring-1 ring-line px-3 py-3 hover:bg-vapur/10 hover:ring-vapur/30 transition group"
            >
              <div className="text-2xl">{q.icon}</div>
              <div className="mt-1 font-display font-semibold text-sm leading-tight">
                {q.label}
              </div>
              <div className="text-[11px] text-on-mute mt-0.5">{q.hint}</div>
            </Link>
          ))}
        </div>
      </section>

      <div className="animate-fade-in-up delay-3">
        <FavoritesQuick />
      </div>
    </>
  );
}
