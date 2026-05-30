// Petrol Ofisi resmi sayfasından canlı İstanbul fiyatları.
// Sayfa düz HTML olarak "İstanbul Avrupa'da bugünkü güncel benzin litre fiyatı X TL"
// formatında yayınlıyor — regex ile çekiyoruz.

const PO_URL = "https://www.petrolofisi.com.tr/akaryakit-fiyatlari";

export type SidePrices = {
  benzin95?: number;
  motorin?: number;
  lpg?: number;
};

export type LivePrices = {
  source: "PO";
  asOf: string;
  fetchedAt: number;
  url: string;
  istanbulAvrupa: SidePrices;
  istanbulAnadolu: SidePrices;
};

export type LivePricesEmpty = { error: string };

export async function fetchLiveFuelPrices(): Promise<
  LivePrices | LivePricesEmpty
> {
  try {
    const res = await fetch(PO_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "tr-TR,tr;q=0.9",
      },
      next: { revalidate: 21600, tags: ["fuel-live"] },
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };

    const html = await res.text();

    const parse = (
      side: "Avrupa" | "Anadolu",
      kw: string
    ): number | undefined => {
      const re = new RegExp(
        `İstanbul ${side}[^.]{0,90}?${kw}[^.]{0,90}?(\\d+[.,]\\d{1,4})`,
        "i"
      );
      const m = html.match(re);
      if (!m) return undefined;
      const val = parseFloat(m[1].replace(",", "."));
      return Number.isFinite(val) ? val : undefined;
    };

    const avrupa: SidePrices = {
      benzin95: parse("Avrupa", "benzin"),
      motorin: parse("Avrupa", "mazot"),
      lpg: parse("Avrupa", "lpg"),
    };
    const anadolu: SidePrices = {
      benzin95: parse("Anadolu", "benzin"),
      motorin: parse("Anadolu", "mazot"),
      lpg: parse("Anadolu", "lpg"),
    };

    return {
      source: "PO",
      asOf: new Date().toISOString().slice(0, 10),
      fetchedAt: Date.now(),
      url: PO_URL,
      istanbulAvrupa: avrupa,
      istanbulAnadolu: anadolu,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
