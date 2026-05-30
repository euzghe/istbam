"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🚿"
        eyebrow="OSM canlı"
        title="Oto Yıkama"
        description="Yakın ve şehir geneli oto yıkama / self-servis noktaları. Renk: self/otomatik (yeşil), markalı (mavi)."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="yikama"
          title="Yakın Yıkama Noktaları"
          footerNote="OSM'de markasız kayıtlar 'Oto Yıkama' olarak gösterilir. Fiyat ve çalışma saatleri için noktaya gidip kontrol etmek en doğrusu."
        />
      </div>
    </>
  );
}
