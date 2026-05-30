import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "İstbam — İstanbul'da arabayla olanların yardımcısı",
    short_name: "İstbam",
    description:
      "Şerit rehberi, İSPARK doluluk, arabalı vapur, trafik. İstanbul'da direksiyonda kaybolma.",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#050d1a",
    theme_color: "#0a1d3a",
    lang: "tr",
    dir: "ltr",
    categories: ["navigation", "travel", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Sürücü Paneli",
        short_name: "Panel",
        description: "Şerit rehberi, İSPARK, trafik",
        url: "/panel",
      },
    ],
  };
}
