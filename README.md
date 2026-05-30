# İstbam

**İstanbul'da arabayla olanların yardımcısı.**
"İst" (İstanbul) + "ara**bam**".

Şerit rehberi · İSPARK doluluk · trafik · köprü ücretleri · akaryakıt fiyatları · HGS tarifesi · arabalı vapur · acil yardım — hepsi tek panelde, gerçek API'lerle.

---

## Canlı veri kaynakları

| Modül | Kaynak |
|---|---|
| Şerit rehberi (`turn:lanes`) | OpenStreetMap (Overpass API) |
| Rota & navigasyon | OSRM (router.project-osrm.org) |
| İSPARK (258 otopark, doluluk + tarife) | İBB Açık API |
| Şehir trafik indeksi (5 dk aralık) | İBB TKM `TrafficIndexHistory` |
| Akaryakıt istasyonları | OpenStreetMap (Overpass) |
| Köprü/otoyol/tünel ücretleri | KGM + operatör resmi (manuel güncellenir) |
| Akaryakıt fiyatları | EPDK + marka resmi sayfalar (manuel referans) |

## Geliştirme

```bash
npm install
npm run dev
```

- Ana sayfa: <http://localhost:3000>
- Panel: <http://localhost:3000/panel>

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + dinamik tema (light/dark)
- MapLibre GL + OpenFreeMap (positron/dark)
- Web Speech API (Türkçe sesli uyarı)
- PWA (manifest + service worker, çevrimdışı çekirdek)

## Yapı

```
src/
  app/
    page.tsx               Ana sayfa (hero + tanıtım)
    panel/                 Sürücü paneli (route-based)
      layout.tsx           PanelShell (TopBar + SideNav + state context)
      page.tsx             Şerit Rehberi (default)
      ispark/page.tsx      İSPARK
      trafik/page.tsx      Trafik & köprüler
      akaryakit/page.tsx   Akaryakıt
      hgs/page.tsx         HGS bakiye + tarife
      yardim/page.tsx      Acil yardım & çekici
      vapur/page.tsx       Arabalı vapur
      uyari/page.tsx       Yol uyarısı
      arabam/page.tsx      Park ettiğim yer
    api/
      lanes/route.ts       Overpass → turn:lanes
      route/route.ts       OSRM → rota & step-by-step
      ispark/route.ts      İBB → 258 otopark
      ispark/[id]/route.ts İBB → tek otopark tam tarife
      traffic/route.ts     İBB TKM → trafik indeksi
      fuel/route.ts        Overpass → akaryakıt istasyonları
  components/
    panel/
      PanelShell.tsx       Üst bar + sidebar + state context
      PanelContext.tsx     React context
      SideNav.tsx          Sol navigasyon (3 grup)
      MapView.tsx          MapLibre overlay
      MapOverlay.tsx       Tam ekran harita modal
      NaviMini.tsx         Gömülü navi (gerçek route polyline)
      IstanbulBackdrop.tsx Silik İstanbul siluetleri arka plan
      cards/               Kartlar (Lane, İSPARK, Trafik, …)
      sections/            Sayfa başlıkları + StatusStrip + NextManeuver
  lib/
    overpass.ts            OSM turn:lanes fetcher
    route-source.ts        OSRM fetcher
    ispark-source.ts       İBB İSPARK fetcher
    traffic-source.ts      İBB TKM fetcher
    fuel-source.ts         OSM amenity=fuel fetcher
    geo.ts                 Haversine
  data/                    Statik referans (junctions, bridges, hgs, ferries)
public/
  sw.js                    Service worker (cache stratejileri)
  icon-*.png/svg           PWA ikonları
```

## Lisans

MIT
