"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { FuelCard } from "@/components/panel/cards/FuelCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  const { live, destination } = usePanel();
  return (
    <>
      <PageHeader
        icon="⛽"
        eyebrow="EPDK + OSM"
        title="Akaryakıt"
        description="Bugünkü fiyatlar, yakındaki istasyonlar (OSM canlı), marka resmi tarifeleri."
        accent="vapur"
      />
      <div className="animate-fade-in-up delay-1">
        <FuelCard
          live={live ? { lng: live.lng, lat: live.lat } : undefined}
          destination={
            destination
              ? {
                  lng: destination.lng,
                  lat: destination.lat,
                  label: destination.label,
                }
              : undefined
          }
        />
      </div>
    </>
  );
}
