// Open-Meteo — ücretsiz, anahtarsız, ticari kullanım dahi serbest.
// https://api.open-meteo.com/v1/forecast
// WMO Weather Codes: https://open-meteo.com/en/docs

export type WeatherCondition =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunderstorm"
  | "unknown";

export type WeatherSnapshot = {
  source: "open-meteo";
  tempC: number;
  feelsLikeC?: number;
  windKmh: number;
  humidity?: number;
  precipitationMm: number;
  condition: WeatherCondition;
  conditionLabel: string;
  weatherCode: number;
  // Sürücüye anlamlı uyarı (varsa)
  driverAlert?: { level: "info" | "warn" | "danger"; text: string };
  fetchedAt: number;
};

export type WeatherEmpty = {
  source: "empty";
  reason: string;
};

const ISTANBUL_LAT = 41.0082;
const ISTANBUL_LNG = 28.9784;

const URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${ISTANBUL_LAT}&longitude=${ISTANBUL_LNG}` +
  `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
  `precipitation,weather_code,wind_speed_10m` +
  `&timezone=Europe/Istanbul`;

function classify(code: number): { c: WeatherCondition; label: string } {
  if (code === 0) return { c: "clear", label: "Açık" };
  if (code <= 2) return { c: "partly-cloudy", label: "Parçalı bulutlu" };
  if (code === 3) return { c: "cloudy", label: "Çok bulutlu" };
  if (code === 45 || code === 48) return { c: "fog", label: "Sisli" };
  if (code >= 51 && code <= 57) return { c: "drizzle", label: "Çisenti" };
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return { c: "rain", label: "Yağmurlu" };
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86))
    return { c: "snow", label: "Karlı" };
  if (code >= 95) return { c: "thunderstorm", label: "Gök gürültülü" };
  return { c: "unknown", label: "Bilinmiyor" };
}

function buildAlert(
  cond: WeatherCondition,
  precip: number,
  windKmh: number,
  tempC: number,
): WeatherSnapshot["driverAlert"] {
  if (cond === "snow")
    return { level: "danger", text: "Kar var — zincir veya kış lastiği şart" };
  if (cond === "thunderstorm")
    return { level: "danger", text: "Fırtına — Boğaz köprülerinde rüzgar yüksek olabilir" };
  if (cond === "fog")
    return { level: "warn", text: "Sis var — sis farını aç, takip mesafesi 2 katı" };
  if (cond === "rain" && precip >= 2)
    return { level: "warn", text: "Sağanak — fren mesafesi uzar, hızını düşür" };
  if (cond === "rain")
    return { level: "info", text: "Yağmur var — yol ıslak, dikkatli sür" };
  if (windKmh >= 50)
    return { level: "warn", text: "Şiddetli rüzgar — Boğaz köprülerinde araç savrulabilir" };
  if (tempC <= 1)
    return { level: "warn", text: "Buzlanma riski — özellikle köprü ve viyadüklerde" };
  return undefined;
}

export async function fetchWeather(): Promise<WeatherSnapshot | WeatherEmpty> {
  try {
    const res = await fetch(URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 600, tags: ["weather"] }, // 10 dakika cache
    });
    if (!res.ok) return { source: "empty", reason: `HTTP ${res.status}` };
    const data = await res.json();
    const cur = data?.current;
    if (!cur) return { source: "empty", reason: "current alanı yok" };

    const code = Number(cur.weather_code ?? -1);
    const { c, label } = classify(code);
    const tempC = Number(cur.temperature_2m);
    const windKmh = Number(cur.wind_speed_10m);
    const precip = Number(cur.precipitation ?? 0);

    return {
      source: "open-meteo",
      tempC: Math.round(tempC),
      feelsLikeC: cur.apparent_temperature != null
        ? Math.round(Number(cur.apparent_temperature))
        : undefined,
      windKmh: Math.round(windKmh),
      humidity: cur.relative_humidity_2m != null
        ? Math.round(Number(cur.relative_humidity_2m))
        : undefined,
      precipitationMm: precip,
      condition: c,
      conditionLabel: label,
      weatherCode: code,
      driverAlert: buildAlert(c, precip, windKmh, tempC),
      fetchedAt: Date.now(),
    };
  } catch (e) {
    return { source: "empty", reason: (e as Error).message };
  }
}

export function weatherEmoji(c: WeatherCondition): string {
  switch (c) {
    case "clear": return "☀️";
    case "partly-cloudy": return "⛅";
    case "cloudy": return "☁️";
    case "fog": return "🌫";
    case "drizzle": return "🌦";
    case "rain": return "🌧";
    case "snow": return "❄️";
    case "thunderstorm": return "⛈";
    default: return "🌡";
  }
}
