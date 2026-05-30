"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🚕"
        eyebrow="OSM canlı"
        title="Taksi Durakları"
        description="Yakındaki taksi durakları. Renk: klasik durak (sarı), büyük durak (yeşil), havalimanı (pembe)."
        accent="vapur"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="taksi"
          title="Yakın Taksi Durakları"
          officialLinks={[
            {
              label: "BiTaksi",
              url: "https://bitaksi.com",
            },
            {
              label: "iTaksi (resmi)",
              url: "https://www.itaksi.com.tr",
            },
          ]}
          footerNote="Çağrı için BiTaksi veya iTaksi uygulamalarını kullan — daha hızlı eşleşir."
        />
      </div>
    </>
  );
}
