"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { HelpCard } from "@/components/panel/cards/HelpCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  const { live } = usePanel();
  return (
    <>
      <PageHeader
        icon="🆘"
        eyebrow="Acil çağrı"
        title="Yardım & Çekici"
        description="112 büyük acil, kendi sigorta numaran (kaydet), trafik polisi, jandarma, konumunu tek tıkla paylaş."
        accent="vapur-red"
      />
      <div className="animate-fade-in-up delay-1">
        <HelpCard live={live ? { lng: live.lng, lat: live.lat } : undefined} />
      </div>
    </>
  );
}
