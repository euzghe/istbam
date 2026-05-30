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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://istbam.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "İstbam — İstanbul'da arabayla olanların yardımcısı",
    template: "%s · İstbam",
  },
  description:
    "İstanbul'da şerit rehberi, anlık trafik, İSPARK doluluk, Boğaz köprüsü karşılaştırması, arabalı vapur, akaryakıt, HGS ve hava durumu. Direksiyonda kaybolma.",
  applicationName: "İstbam",
  keywords: [
    "İstanbul trafik",
    "İstanbul şerit rehberi",
    "İSPARK doluluk",
    "arabalı vapur saatleri",
    "Boğaz köprüsü ücret",
    "FSM köprüsü trafik",
    "Yavuz Sultan Selim köprüsü",
    "Avrasya tüneli",
    "İstanbul navigasyon",
    "İstanbul yol durumu",
    "İstanbul akaryakıt fiyatları",
    "HGS bakiye",
    "araçla İstanbul",
  ],
  authors: [{ name: "Özge Altınok" }],
  creator: "Özge Altınok",
  publisher: "İstbam",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "İstbam — İstanbul'da arabayla olanların yardımcısı",
    description:
      "Şerit rehberi, anlık trafik, İSPARK, Boğaz geçişi karşılaştırması, vapur — hepsi tek panelde, gerçek veriyle.",
    locale: "tr_TR",
    type: "website",
    url: SITE_URL,
    siteName: "İstbam",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "İstbam — İstanbul sürücüsünün cep yardımcısı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İstbam — İstanbul'da arabayla olanların yardımcısı",
    description:
      "Şerit rehberi, anlık trafik, İSPARK, Boğaz geçişi, vapur — gerçek veriyle.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "navigation",
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

// Schema.org WebApplication — Google "uygulama kartı" gösterebilir.
const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "İstbam",
  alternateName: "İstbam — İstanbul Sürücü Yardımcısı",
  url: SITE_URL,
  description:
    "İstanbul'da araçla yolculuk yapanlar için şerit rehberi, anlık trafik, İSPARK doluluk, Boğaz geçişi karşılaştırması, vapur, akaryakıt ve HGS takip uygulaması.",
  applicationCategory: "TravelApplication",
  operatingSystem: "Any (PWA)",
  inLanguage: "tr-TR",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "TRY",
  },
  areaServed: {
    "@type": "City",
    name: "İstanbul",
  },
  featureList: [
    "Şerit rehberi (canlı OSM + İstanbul kavşak veritabanı)",
    "Anlık trafik haritası ve şehir trafik endeksi",
    "İSPARK canlı doluluk",
    "Boğaz köprüsü ve Avrasya tüneli karşılaştırması",
    "Arabalı vapur ve şehir hatları",
    "Akaryakıt fiyatları",
    "HGS bakiye takibi",
    "Hava durumu ve sürücü uyarıları",
  ],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(STRUCTURED_DATA) }}
        />
        <ThemeProvider>
          {children}
          <ServiceWorkerRegister />
        </ThemeProvider>
      </body>
    </html>
  );
}
