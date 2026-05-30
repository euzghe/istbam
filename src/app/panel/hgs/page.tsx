"use client";

import { HgsCard } from "@/components/panel/cards/HgsCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🪪"
        eyebrow="2026 Tarifesi"
        title="HGS Bakiye ve Ücret"
        description="Bakiyeni PTT'den sorgula, köprü/otoyol/tünel ücretlerini gör, geçtiklerini topla."
      />
      <div className="animate-fade-in-up delay-1">
        <HgsCard />
      </div>
    </>
  );
}
