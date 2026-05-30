import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://istbam.vercel.app";

const PANEL_ROUTES = [
  "",
  "serit-rehberi",
  "ispark",
  "trafik",
  "vapur",
  "akaryakit",
  "hastane",
  "eczane",
  "avm",
  "sarj",
  "taksi",
  "yikama",
  "yardim",
  "hgs",
  "arabam",
  "favoriler",
  "uyari",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const panel: MetadataRoute.Sitemap = PANEL_ROUTES.map((r) => ({
    url: `${BASE}/panel${r ? `/${r}` : ""}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: r === "" ? 1.0 : 0.7,
  }));
  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...panel,
  ];
}
