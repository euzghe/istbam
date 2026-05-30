"use client";

import { ParkedCard } from "@/components/panel/cards/ParkedCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="🚗"
        eyebrow="Yerel hafıza"
        title="Arabam"
        description="Park ederken konumunu kaydet, geri dönüşte tek tıkla yol tarifi al."
      />
      <div className="animate-fade-in-up delay-1">
        <ParkedCard />
      </div>
    </>
  );
}
