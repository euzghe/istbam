"use client";

// İBB'nin yol duyurusu CSV arşivi var (data.ibb.gov.tr) ama son güncelleme
// 2025-03; canlı duyuru için resmi REST API açık değil. Bu kart canlı
// duyuru servisi gelene kadar kullanıcıyı resmi haritaya yönlendiriyor.

export function AlertsCard() {
  return (
    <section className="relative">
      <header className="px-1 pt-1 pb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-vapur-red font-semibold">
            ⚠ Yol Uyarıları
          </div>
          <h2 className="mt-1 font-display text-lg font-semibold text-on leading-tight">
            Anlık kapatma, kaza, çalışma
          </h2>
        </div>
        <span
          title="İBB'nin canlı yol duyurusu REST API'si henüz herkese açık değil. Resmi canlı harita: uym.ibb.gov.tr/yharita6"
          className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider bg-mehtap/20 text-mehtap rounded-full px-2 py-0.5 ring-1 ring-mehtap/30"
        >
          API yok
        </span>
      </header>

      <div className="pb-4 text-sm text-on-soft leading-relaxed">
        Canlı anons için <strong className="text-on">İBB Trafik Yönetim Merkezi</strong>'nin
        resmi haritası şu an tek güvenilir kaynak. Açtığında aktif olayları görürsün.
      </div>

      <footer className="rounded-xl bg-bogaz-deep text-sis/85 px-4 py-2.5 flex items-center justify-between gap-3 text-[11px]">
        <span className="truncate text-sis/60">
          Kaynak: İBB UYM (canlı), data.ibb.gov.tr (arşiv 2013-2025)
        </span>
        <a
          href="https://uym.ibb.gov.tr/yharita6/"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-full bg-vapur text-bogaz-deep font-semibold px-3 py-1.5 hover:bg-vapur-soft transition"
        >
          Canlı haritayı aç ↗
        </a>
      </footer>
    </section>
  );
}
