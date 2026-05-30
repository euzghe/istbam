"use client";

import { AlertsCard } from "@/components/panel/cards/AlertsCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";

export default function Page() {
  return (
    <>
      <PageHeader
        icon="⚠"
        eyebrow="İBB UYM"
        title="Yol Uyarıları"
        description="Anlık kaza/kapatma/çalışma için İBB Trafik Yönetim Merkezi'nin canlı haritası."
        accent="vapur-red"
      />
      <div className="animate-fade-in-up delay-1">
        <AlertsCard />
      </div>
    </>
  );
}
