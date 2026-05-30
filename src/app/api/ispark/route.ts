import { fetchIsparkList } from "@/lib/ispark-source";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  try {
    const list = await fetchIsparkList();
    return Response.json(
      { source: "ibb", count: list.length, items: list, fetchedAt: Date.now() },
      {
        headers: {
          "Cache-Control":
            "public, s-maxage=60, stale-while-revalidate=300",
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
