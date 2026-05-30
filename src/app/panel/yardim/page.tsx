"use client";

import { usePanel } from "@/components/panel/PanelContext";
import { HelpCard } from "@/components/panel/cards/HelpCard";
import { PageHeader } from "@/components/panel/sections/PageHeader";
import { PoiPanel } from "@/components/panel/cards/PoiPanel";

export default function Page() {
  const { live } = usePanel();
  return (
    <>
      <PageHeader
        icon="🆘"
        eyebrow="Acil çağrı + Çekici"
        title="Yardım & Çekici"
        description="112 büyük acil, kendi sigorta numaran (kaydet), en yakın çekiciler/yol yardım, konumunu tek tıkla paylaş."
        accent="vapur-red"
      />
      <div className="animate-fade-in-up delay-1 space-y-4">
        <HelpCard live={live ? { lng: live.lng, lat: live.lat } : undefined} />

        <div>
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-vapur-red font-bold mb-2">
            🚛 En yakın çekici / yol yardım
          </div>
          <PoiPanel
            type="cekici"
            title="Çekici & Oto Servisleri"
            footerNote="OSM'de 'çekici' özel etiketi sınırlı; kırmızı = adı/etiketi 'çekici/yol yardım' içerir, mavi = genel oto servis (çoğu zaman çekici de yapar). Aramadan önce sigortanın kasko hattını dene — daha hızlı."
          />
        </div>
      </div>
    </>
  );
}
