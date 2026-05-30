import { fetchTrafficSnapshot } from "@/lib/traffic-source";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET() {
  const data = await fetchTrafficSnapshot();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
