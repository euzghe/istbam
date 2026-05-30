"use client";

import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🏬"
        eyebrow="OSM canlı"
        title="AVM ve Outlet'ler"
        description="Yakındaki alışveriş merkezleri ve outlet'ler — yol tarifi tek tıkla."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1 space-y-3">
        <PoiPanel
          type="avm"
          title="Yakın AVM/Outlet"
          footerNote="OSM'de listelenmemiş yerler için Google Maps gibi servisler daha kapsamlı olabilir."
        />
      </div>
    </>
  );
}
