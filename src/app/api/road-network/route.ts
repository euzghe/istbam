import { fetchRoadNetwork } from "@/lib/road-network-source";

export const runtime = "nodejs";
export const revalidate = 86400; // 24 saat

export async function GET() {
  try {
    const data = await fetchRoadNetwork();
    return Response.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message, type: "FeatureCollection", features: [] },
      { status: 200 }
    );
  }
}
