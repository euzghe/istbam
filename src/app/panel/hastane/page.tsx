"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🏥"
        eyebrow="OSM canlı + Sağlık Bakanlığı"
        title="Hastaneler"
        description="Yakın hastane ve klinikler. Renk: yeşil = devlet, pembe = özel, amber = üniversite."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="hastane"
          title="Yakın Hastaneler"
          officialLinks={[
            {
              label: "Sağlık Bakanlığı hastane arama",
              url: "https://hastane.saglik.gov.tr/",
            },
            {
              label: "MHRS randevu",
              url: "https://mhrs.gov.tr/Vatandas/",
            },
          ]}
          footerNote="Acil durumda 112 — Yardım sayfasından tek tıkla."
        />
      </div>
    </>
  );
}
