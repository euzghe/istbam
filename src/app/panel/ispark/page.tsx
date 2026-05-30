"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { IsparkCard } from "@/components/panel/cards/IsparkCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  const {
    nearestIsparks,
    isparkLoading,
    destination,
    isparks,
    openMapAll,
    openMapForIspark,
  } = usePanel();

  return (
    <>
      <PageHeader
        icon="🅿"
        eyebrow="İBB canlı veri"
        title="İSPARK Bul"
        description="İBB'nin 258 otoparkı canlı doluluk + tam tarife. Tıkla → tarifeyi gör, haritada yerini aç, yol tarifi al."
        badge={
          <span className="bg-cini/15 text-cini rounded-full px-2 py-0.5 ml-1">
            {isparks.length || "..."} canlı
          </span>
        }
      />
      <div className="animate-fade-in-up delay-1">
        <IsparkCard
          items={nearestIsparks}
          destinationLabel={destination?.label}
          loading={isparkLoading}
          onShowMap={openMapAll}
          onShowOnMap={openMapForIspark}
        />
      </div>
    </>
  );
}
