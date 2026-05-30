"use client";

import { TrafficCard } from "@/components/panel/cards/TrafficCard";
import { TrafficMapCard } from "@/components/panel/sections/TrafficMapCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🚦"
        eyebrow="İBB canlı veri"
        title="Trafik & Köprüler"
        description="İBB Trafik Yönetim Merkezi'nden anlık şehir endeksi, harita üstünde köprü yoğunluğu, ücretler."
        accent="vapur"
      />
      <div className="animate-fade-in-up delay-1">
        <TrafficMapCard />
      </div>
      <div className="animate-fade-in-up delay-2">
        <TrafficCard />
      </div>
    </>
  );
}
