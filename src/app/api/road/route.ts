import { fetchNearestRoadAndCameras } from "@/lib/road-source";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lng = parseFloat(searchParams.get("lng") ?? "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return Response.json({ error: "lat/lng gerekli" }, { status: 400 });
  }
  const data = await fetchNearestRoadAndCameras(lat, lng);
  return Response.json(
    { ...data, fetchedAt: Date.now() },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=900",
      },
    }
  );
}
