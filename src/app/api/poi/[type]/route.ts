import { fetchPoi, fetchPoiIstanbul, type PoiType } from "@/lib/poi-source";

export const runtime = "nodejs";
export const revalidate = 3600;

const VALID: PoiType[] = [
  "hastane",
  "eczane",
  "avm",
  "sarj",
  "yikama",
  "taksi",
];

export async function GET(
  req: Request,
  ctx: { params: Promise<{ type: string }> }
) {
  const { type } = await ctx.params;
  if (!VALID.includes(type as PoiType)) {
    return Response.json(
      { error: "Geçersiz tip; hastane|eczane|avm|sarj bekleniyor" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope"); // "istanbul" | null

  try {
    if (scope === "istanbul") {
      const items = await fetchPoiIstanbul(type as PoiType);
      return Response.json(
        {
          source: "osm",
          scope: "istanbul",
          type,
          count: items.length,
          items,
          fetchedAt: Date.now(),
        },
        {
          headers: {
            "Cache-Control":
              "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    // Yakın çevre
    const lat = parseFloat(searchParams.get("lat") ?? "");
    const lng = parseFloat(searchParams.get("lng") ?? "");
    const radius = parseFloat(searchParams.get("r") ?? "3000");
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json(
        { error: "lat/lng gerekli (veya scope=istanbul)" },
        { status: 400 }
      );
    }
    const items = await fetchPoi(type as PoiType, lat, lng, radius);
    return Response.json(
      {
        source: "osm",
        scope: "nearby",
        type,
        count: items.length,
        items,
        fetchedAt: Date.now(),
      },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { source: "error", error: (e as Error).message, items: [] },
      { status: 200 }
    );
  }
}
