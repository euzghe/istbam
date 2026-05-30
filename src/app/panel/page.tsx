"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { LaneCard } from "@/components/panel/cards/LaneCard";
import {
  NoJunctionCard,
  LocationBanner,
} from "@/components/panel/sections/NoJunctionCard";
import { StatusStrip } from "@/components/panel/sections/StatusStrip";
import { PageHeader } from "@/components/panel/sections/PageHeader";
import { NextManeuverCard } from "@/components/panel/sections/NextManeuverCard";

export default function PanelHome() {
  const {
    activeJunction,
    destination,
    live,
    geoError,
    navigating,
    nextManeuver,
    route,
  } = usePanel();

  return (
    <>
      <PageHeader
        icon="🧭"
        eyebrow={navigating ? "Yönlendirme aktif" : "Sürüş anı"}
        title="Şerit Rehberi"
        description={
          navigating
            ? `"${destination?.label}" için yaklaşan kavşakta hangi şeritte olman gerektiğini görürsün.`
            : "Yaklaştığın kavşaktaki şerit kararını canlı veriyle gösterir."
        }
        accent={navigating ? "vapur" : "cini"}
      />
      <StatusStrip />
      {!live && (
        <div className="animate-fade-in-up delay-1">
          <LocationBanner
            geoError={geoError}
            hasDestination={!!destination}
          />
        </div>
      )}

      {nextManeuver && route && (
        <div className="animate-fade-in-up delay-1">
          <NextManeuverCard
            arrow={nextManeuver.step.maneuver.arrow}
            instruction={nextManeuver.step.maneuver.instruction}
            distanceM={nextManeuver.distM}
            totalDistanceM={route.distance}
            totalDurationS={route.duration}
          />
        </div>
      )}

      <div className="animate-fade-in-up delay-2">
        {activeJunction ? (
          <LaneCard
            junction={activeJunction.j}
            liveDistanceM={activeJunction.distanceM}
            destinationLabel={destination?.label}
            userLng={live?.lng}
            userLat={live?.lat}
            navigating={navigating}
            routeGeometry={route?.geometry}
            maneuverLngLat={nextManeuver?.step.maneuver.location}
          />
        ) : (
          <NoJunctionCard
            hasLive={!!live}
            hasDestination={!!destination}
          />
        )}
      </div>
    </>
  );
}
