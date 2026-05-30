import { fetchOsmLanes } from "@/lib/overpass";

export const runtime = "nodejs";
// Cache: 1 saat (Overpass'taki Next fetch cache zaten kullanıyor; bu
// route'un kendisi de Edge/Node default'unda iyi davranır.)
export const revalidate = 3600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  const radius = parseFloat(searchParams.get("r") ?? "90");

  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json(
      { error: "lat ve lng gerekli (sayı)" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchOsmLanes(lat, lng, radius);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (e) {
    return Response.json(
      { source: "empty", reason: (e as Error).message },
      { status: 200 }
    );
  }
}
