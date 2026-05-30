"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export type SectionId =
  | "lane"
  | "ispark"
  | "trafik"
  | "akaryakit"
  | "hgs"
  | "yardim"
  | "vapur"
  | "uyari"
  | "arabam"
  | "hastane"
  | "eczane"
  | "avm"
  | "sarj"
  | "favoriler";

type Item = {
  id: SectionId;
  href: string;
  label: string;
  icon: string;
  hint?: string;
};

type Group = { title: string; items: Item[] };

export const SECTIONS: Group[] = [
  {
    title: "Sürüş",
    items: [
      { id: "lane", href: "/panel", label: "Şerit Rehberi", icon: "🧭", hint: "Yaklaşan kavşak" },
      { id: "trafik", href: "/panel/trafik", label: "Trafik", icon: "🚦", hint: "Şehir + köprüler" },
      { id: "uyari", href: "/panel/uyari", label: "Yol Uyarısı", icon: "⚠", hint: "Kapatma / kaza" },
    ],
  },
  {
    title: "Park & Ücret",
    items: [
      { id: "ispark", href: "/panel/ispark", label: "İSPARK", icon: "🅿", hint: "258 canlı" },
      { id: "akaryakit", href: "/panel/akaryakit", label: "Akaryakıt", icon: "⛽", hint: "Fiyat + istasyon" },
      { id: "sarj", href: "/panel/sarj", label: "EV Şarj", icon: "⚡", hint: "Trugo/ZES/Eşarj" },
      { id: "hgs", href: "/panel/hgs", label: "HGS", icon: "🪪", hint: "Bakiye + tarife" },
    ],
  },
  {
    title: "Yakın Yer",
    items: [
      { id: "hastane", href: "/panel/hastane", label: "Hastaneler", icon: "🏥", hint: "Devlet / özel" },
      { id: "eczane", href: "/panel/eczane", label: "Eczaneler", icon: "💊", hint: "Nöbetçi / 24h" },
      { id: "avm", href: "/panel/avm", label: "AVM / Outlet", icon: "🏬", hint: "Yakındakiler" },
    ],
  },
  {
    title: "Bilgi & Yardım",
    items: [
      { id: "yardim", href: "/panel/yardim", label: "Yardım", icon: "🆘", hint: "112 + sigortam" },
      { id: "vapur", href: "/panel/vapur", label: "Arabalı Vapur", icon: "⛴", hint: "Eskihisar-Topçular" },
      { id: "arabam", href: "/panel/arabam", label: "Arabam", icon: "🚗", hint: "Park ettiğim yer" },
      { id: "favoriler", href: "/panel/favoriler", label: "Favoriler", icon: "⭐", hint: "Ev / İş / özel" },
    ],
  },
];

type Props = {
  open: boolean;
  setOpen: (v: boolean) => void;
};

export function SideNav({ open, setOpen }: Props) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-bogaz-deep/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          bg-bogaz-deep text-sis flex flex-col shrink-0
          transition-[width,transform] duration-300 ease-out
          border-r border-sis/10
          ${
            open
              ? "fixed lg:relative inset-y-0 left-0 z-40 w-72 lg:w-60 translate-x-0 shadow-2xl shadow-bogaz-deep/40 lg:shadow-none"
              : "hidden lg:flex lg:w-16"
          }
        `}
        aria-label="Bölümler"
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-sis/10 shrink-0">
          {open ? (
            <>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-vapur font-bold">
                  Bölümler
                </div>
                <div className="text-[10px] text-sis/55 mt-0.5">
                  Tıkla → karta git
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-8 rounded-full bg-sis/10 hover:bg-sis/20 text-sis transition flex items-center justify-center"
                aria-label="Kenar çubuğunu kapat"
                title="Daralt"
              >
                <span className="text-base leading-none">‹</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setOpen(true)}
              className="size-10 mx-auto rounded-full bg-sis/10 hover:bg-vapur hover:text-bogaz-deep text-sis transition flex items-center justify-center"
              aria-label="Kenar çubuğunu aç"
              title="Genişlet"
            >
              <span className="text-base leading-none">›</span>
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {SECTIONS.map((g, gi) => (
            <div key={g.title} className={gi > 0 ? "mt-4" : ""}>
              {open && (
                <div className="px-4 mb-1.5">
                  <div className="text-[9px] uppercase tracking-widest text-sis/45 font-bold">
                    {g.title}
                  </div>
                </div>
              )}
              {!open && gi > 0 && (
                <div className="mx-3 my-2 border-t border-sis/10" />
              )}
              <ul className="space-y-0.5 px-2">
                {g.items.map((s) => {
                  const active = pathname === s.href;
                  return (
                    <li key={s.id}>
                      <Link
                        href={s.href}
                        onClick={() => {
                          if (isMobile) setOpen(false);
                        }}
                        className={`group w-full flex items-center gap-3 rounded-lg transition relative ${
                          open ? "px-2.5 py-2" : "justify-center px-0 py-2.5"
                        } ${
                          active
                            ? "bg-vapur text-bogaz-deep shadow-sm shadow-bogaz-deep/40"
                            : "text-sis hover:bg-sis/8"
                        }`}
                        title={!open ? s.label : undefined}
                      >
                        {active && !open && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-bogaz-deep" />
                        )}
                        <span
                          className={`flex items-center justify-center shrink-0 rounded-md transition ${
                            open ? "size-8" : "size-9"
                          } ${
                            active
                              ? "bg-bogaz-deep/15"
                              : "bg-sis/5 group-hover:bg-sis/10"
                          }`}
                        >
                          <span className="text-base leading-none">{s.icon}</span>
                        </span>
                        {open && (
                          <div className="flex-1 min-w-0 text-left">
                            <div
                              className={`text-sm font-semibold leading-tight truncate ${
                                active ? "text-bogaz-deep" : "text-sis"
                              }`}
                            >
                              {s.label}
                            </div>
                            {s.hint && (
                              <div
                                className={`text-[10px] truncate leading-tight ${
                                  active ? "text-bogaz-deep/70" : "text-sis/55"
                                }`}
                              >
                                {s.hint}
                              </div>
                            )}
                          </div>
                        )}
                        {active && open && (
                          <span className="text-[10px] font-bold leading-none">
                            ●
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {open && (
          <div className="px-4 py-3 border-t border-sis/10 text-[10px] leading-relaxed">
            <div className="flex items-center gap-1.5 text-cini-soft">
              <span className="size-1.5 rounded-full bg-cini animate-pulse" />
              <span className="font-semibold">Canlı veri</span>
            </div>
            <div className="text-sis/50 mt-1">İBB · OSM · TKM</div>
          </div>
        )}
      </aside>
    </>
  );
}
