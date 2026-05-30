import { geocode } from "@/lib/geocode-source";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (q.trim().length < 2) {
    return Response.json({ items: [] });
  }
  const items = await geocode(q);
  return Response.json(
    { items },
    {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    }
  );
}
