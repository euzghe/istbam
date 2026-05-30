"use client";

import { TrafficCard } from "@/components/panel/cards/TrafficCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🚦"
        eyebrow="İBB canlı veri"
        title="Trafik & Köprüler"
        description="İBB Trafik Yönetim Merkezi'nden anlık şehir endeksi, sparkline, köprü ücretleri."
        accent="vapur"
      />
      <div className="animate-fade-in-up delay-1">
        <TrafficCard />
      </div>
    </>
  );
}
