"use client";

import { FerryCard } from "@/components/panel/cards/FerryCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="⛴"
        eyebrow="Gestaş"
        title="Arabalı Vapur"
        description="İstanbul bölgesinde aktif tek hat: Eskihisar–Topçular. Karayolu vs vapur karşılaştırması."
        accent="cini"
      />
      <div className="animate-fade-in-up delay-1">
        <FerryCard />
      </div>
    </>
  );
}
