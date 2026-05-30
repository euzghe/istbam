"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="💊"
        eyebrow="OSM + resmi nöbetçi listesi"
        title="Eczaneler"
        description="Yakındaki eczaneler. Yeşil işaret 24 saat açık olanlar; nöbetçi olup olmadığı resmi listeye bağlı."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="eczane"
          title="Yakın Eczaneler"
          officialLinks={[
            {
              label: "e-Devlet nöbetçi eczane sorgu",
              url: "https://www.turkiye.gov.tr/saglik-bakanligi-nobetci-eczane-arama",
            },
            {
              label: "İstanbul Eczacı Odası",
              url: "https://www.istanbuleczaciodasi.org.tr/nobetci-eczaneler/",
            },
          ]}
          footerNote="* Nöbetçi eczane bilgisi resmi API ile yayımlanmıyor. Burada 24 saat açık olarak işaretliyiz; o günkü nöbet listesi için e-Devlet linkini aç."
        />
      </div>
    </>
  );
}
