"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="⚡"
        eyebrow="OSM canlı"
        title="EV Şarj İstasyonları"
        description="Yakındaki ve İstanbul genelindeki elektrikli araç şarj noktaları. Renk: operatör veya hız (DC/AC)."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="sarj"
          title="Yakın EV Şarj Noktaları"
          officialLinks={[
            {
              label: "Trugo",
              url: "https://trugo.com.tr",
            },
            {
              label: "ZES",
              url: "https://www.zes.net",
            },
            {
              label: "Eşarj",
              url: "https://www.esarj.com",
            },
            {
              label: "Voltrun",
              url: "https://www.voltrun.com",
            },
          ]}
          footerNote="Operatör uygulamasından canlı doluluk ve fiyat: Trugo / ZES / Eşarj kendi mobil uygulamalarında. OSM verisi konum + operatör bilgisi sağlar."
        />
      </div>
    </>
  );
}
