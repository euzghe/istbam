// OSRM (Open Source Routing Machine) public demo ile gerçek karayolu rotası
// https://router.project-osrm.org — ücretsiz, gerçek OSM yol grafiği üzerinde

const OSRM = "https://router.project-osrm.org";

export type Maneuver = {
  type: string;
  modifier?: string;
  instruction: string;
  location: [number, number];
  arrow: string;
};

export type RouteStep = {
  distance: number; // metre
  duration: number; // saniye
  name: string;     // yol adı
  maneuver: Maneuver;
};

export type Route = {
  geometry: { type: "LineString"; coordinates: [number, number][] };
  distance: number;
  duration: number;
  steps: RouteStep[];
};

export type RouteEmpty = { error: string };

export async function fetchRoute(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number }
): Promise<Route | RouteEmpty> {
  const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM}/route/v1/driving/${coords}?overview=full&steps=true&geometries=geojson&annotations=false`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "istbam/0.1 (hello@istbam.app)",
      },
      next: { revalidate: 180, tags: ["route"] },
    });
    if (!res.ok) return { error: `OSRM HTTP ${res.status}` };
    const data = await res.json();
    if (!data?.routes?.length) return { error: "Rota bulunamadı" };
    const r = data.routes[0];
    const rawSteps = r.legs?.[0]?.steps ?? [];

    return {
      geometry: r.geometry,
      distance: r.distance,
      duration: r.duration,
      steps: rawSteps.map(
        (s: {
          distance: number;
          duration: number;
          name?: string;
          maneuver: { type: string; modifier?: string; location: [number, number] };
        }) => ({
          distance: s.distance,
          duration: s.duration,
          name: s.name ?? "",
          maneuver: {
            type: s.maneuver.type,
            modifier: s.maneuver.modifier,
            location: s.maneuver.location,
            arrow: maneuverArrow(s.maneuver),
            instruction: maneuverTr(s.maneuver, s.name ?? ""),
          },
        })
      ),
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

function maneuverArrow(m: { type: string; modifier?: string }): string {
  if (m.type === "arrive") return "🏁";
  if (m.type === "depart") return "▶";
  const mod = (m.modifier ?? "").toLowerCase();
  if (mod.includes("uturn")) return "↩";
  if (mod === "sharp left") return "⤺";
  if (mod === "sharp right") return "⤻";
  if (mod === "left") return "←";
  if (mod === "right") return "→";
  if (mod === "slight left") return "↖";
  if (mod === "slight right") return "↗";
  if (mod === "straight") return "↑";
  return "↑";
}

function maneuverTr(
  m: { type: string; modifier?: string },
  roadName: string
): string {
  const dir: Record<string, string> = {
    left: "Sola dön",
    right: "Sağa dön",
    "slight left": "Hafif sola yönel",
    "slight right": "Hafif sağa yönel",
    "sharp left": "Keskin sola dön",
    "sharp right": "Keskin sağa dön",
    straight: "Düz devam",
    uturn: "U dönüşü yap",
  };
  const mod = (m.modifier ?? "").toLowerCase();
  const dirText = dir[mod] ?? "";

  const tail = roadName ? ` · ${roadName}` : "";

  switch (m.type) {
    case "depart":
      return `Yola çık${tail}`;
    case "arrive":
      return "Hedefe vardın";
    case "turn":
      return `${dirText || "Dön"}${tail}`;
    case "continue":
      return `${dirText || "Düz devam"}${tail}`;
    case "merge":
      return `${mod === "right" ? "Sağa" : mod === "left" ? "Sola" : ""} katıl${tail}`;
    case "on ramp":
      return `Otoyola gir${tail}`;
    case "off ramp":
      return `Otoyoldan çık${tail}`;
    case "fork":
      return `${dirText || "Çatallanma"}${tail}`;
    case "roundabout":
    case "rotary":
      return `Dönel kavşağa gir${tail}`;
    case "exit roundabout":
    case "exit rotary":
      return `Dönelden çık${tail}`;
    case "new name":
      return `Yola devam${tail}`;
    case "notification":
      return `Yola devam${tail}`;
    default:
      return `${dirText || "Devam"}${tail}`;
  }
}

export function fmtDuration(seconds: number): string {
  const m = Math.round(seconds / 60);
  if (m < 60) return `${m} dk`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h} sa ${mm} dk`;
}

export function fmtDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
