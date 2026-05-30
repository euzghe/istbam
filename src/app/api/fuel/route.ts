import { fetchFuelStations, normalizeBrand } from "@/lib/fuel-source";

export const runtime = "nodejs";
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("r") ?? "1500");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json({ error: "lat/lng gerekli" }, { status: 400 });
  }

  try {
    const raw = await fetchFuelStations(lat, lng, radius);
    const items = raw.map((s) => ({
      ...s,
      brand: normalizeBrand(s.brand),
    }));
    return Response.json(
      { source: "osm", count: items.length, items, fetchedAt: Date.now() },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (e) {
    return Response.json(
      { source: "empty", error: (e as Error).message, items: [] },
      { status: 200 }
    );
  }
}
