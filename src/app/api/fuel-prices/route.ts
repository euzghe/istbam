import { fetchLiveFuelPrices } from "@/lib/fuel-live";

export const runtime = "nodejs";
export const revalidate = 21600;

export async function GET() {
  const data = await fetchLiveFuelPrices();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
    },
  });
}
