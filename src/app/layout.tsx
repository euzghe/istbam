import type { Metadata, Viewport } from "next";
import { Manrope, Bricolage_Grotesque, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "İstbam — İstanbul'da arabayla olanların yardımcısı",
  description:
    "Şerit rehberi, İSPARK doluluk, arabalı vapur saatleri, trafik ve yol durumu. İstanbul'da direksiyonda kaybolma.",
  applicationName: "İstbam",
  keywords: [
    "İstanbul",
    "trafik",
    "İSPARK",
    "arabalı vapur",
    "şerit rehberi",
    "navigasyon",
  ],
  authors: [{ name: "Özge Altınok" }],
  openGraph: {
    title: "İstbam — İstanbul'da arabayla olanların yardımcısı",
    description:
      "Şerit rehberi, İSPARK, arabalı vapur, trafik — hepsi tek panelde.",
    locale: "tr_TR",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: "İstbam",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1d3a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${manrope.variable} ${bricolage.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-on">
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
