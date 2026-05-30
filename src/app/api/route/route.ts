import { fetchRoute } from "@/lib/route-source";

export const runtime = "nodejs";
export const revalidate = 180;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromLng = parseFloat(searchParams.get("fromLng") ?? "");
  const fromLat = parseFloat(searchParams.get("fromLat") ?? "");
  const toLng = parseFloat(searchParams.get("toLng") ?? "");
  const toLat = parseFloat(searchParams.get("toLat") ?? "");

  if (
    Number.isNaN(fromLng) ||
    Number.isNaN(fromLat) ||
    Number.isNaN(toLng) ||
    Number.isNaN(toLat)
  ) {
    return Response.json(
      { error: "fromLng/fromLat/toLng/toLat (sayı) gerekli" },
      { status: 400 }
    );
  }

  const data = await fetchRoute(
    { lng: fromLng, lat: fromLat },
    { lng: toLng, lat: toLat }
  );

  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=180, stale-while-revalidate=600",
    },
    status: "error" in data ? 200 : 200,
  });
}
