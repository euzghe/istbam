import { fetchIsparkDetail } from "@/lib/ispark-source";

export const runtime = "nodejs";
export const revalidate = 300;

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const num = parseInt(id, 10);
  if (!Number.isFinite(num)) {
    return Response.json({ error: "id sayı olmalı" }, { status: 400 });
  }
  try {
    const detail = await fetchIsparkDetail(num);
    return Response.json(detail, {
      headers: {
        "Cache-Control":
          "public, s-maxage=300, stale-while-revalidate=900",
      },
    });
  } catch (e) {
    return Response.json(
      { error: (e as Error).message },
      { status: 200 }
    );
  }
}
