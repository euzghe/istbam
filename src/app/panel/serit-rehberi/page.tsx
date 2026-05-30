"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { LaneCard } from "@/components/panel/cards/LaneCard";
import { NaviMini } from "@/components/panel/NaviMini";
import {
  NoJunctionCard,
  LocationBanner,
} from "@/components/panel/sections/NoJunctionCard";
import { StatusStrip } from "@/components/panel/sections/StatusStrip";
import { PageHeader } from "@/components/panel/sections/PageHeader";
import { NextManeuverCard } from "@/components/panel/sections/NextManeuverCard";
import { UpcomingSteps } from "@/components/panel/sections/UpcomingSteps";
import { SpeedWidget } from "@/components/panel/sections/SpeedWidget";
import { RouteTollsCard } from "@/components/panel/sections/RouteTollsCard";
import { RouteTrafficCard } from "@/components/panel/sections/RouteTrafficCard";
import { RouteStatusCard } from "@/components/panel/sections/RouteStatusCard";

export default function SeritRehberiPage() {
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

      {/* Harita HER ZAMAN üstte — kavşak/rota gelse de gelmese de.
          Kullanıcı sayfayı açar açmaz konumunu haritada görür. */}
      <NaviMini
        junctionLat={activeJunction?.j.lat}
        junctionLng={activeJunction?.j.lng}
        junctionName={activeJunction?.j.name}
        userLng={live?.lng}
        userLat={live?.lat}
        distanceM={activeJunction?.distanceM}
        routeGeometry={route?.geometry}
        maneuverLngLat={nextManeuver?.step.maneuver.location}
      />

      <StatusStrip />
      <RouteStatusCard />
      <SpeedWidget />
      {!live && (
        <div className="animate-fade-in-up delay-1">
          <LocationBanner
            geoError={geoError}
            hasDestination={!!destination}
          />
        </div>
      )}

      {nextManeuver && route && (
        <>
          <div className="animate-fade-in-up delay-1">
            <NextManeuverCard
              arrow={nextManeuver.step.maneuver.arrow}
              instruction={nextManeuver.step.maneuver.instruction}
              distanceM={nextManeuver.distM}
              totalDistanceM={route.distance}
              totalDurationS={route.duration}
            />
          </div>
          {activeJunction && (
            <div className="animate-fade-in-up delay-2">
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
            </div>
          )}
          <div className="animate-fade-in-up delay-3">
            <UpcomingSteps />
          </div>
          <div className="animate-fade-in-up delay-3">
            <RouteTrafficCard />
          </div>
          <div className="animate-fade-in-up delay-4">
            <RouteTollsCard />
          </div>
        </>
      )}

      {!nextManeuver && (
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
              maneuverLngLat={undefined}
            />
          ) : (
            <NoJunctionCard
              hasLive={!!live}
              hasDestination={!!destination}
            />
          )}
        </div>
      )}
    </>
  );
}
