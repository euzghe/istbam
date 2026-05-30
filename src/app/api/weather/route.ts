import { fetchWeather } from "@/lib/weather-source";

export const runtime = "nodejs";
export const revalidate = 600;

export async function GET() {
  const data = await fetchWeather();
  return Response.json(data, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=1800",
    },
  });
}
