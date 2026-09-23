import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = "https://agenciabaluna.cl";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baluna — Agencia BTL, activaciones y staff promocional en Chile",
    template: "%s · Baluna",
  },
  description:
    "Agencia BTL con operación nacional en Chile. Activaciones de marca, eventos corporativos, lanzamientos y staff promocional. Cotiza tu proyecto.",
  keywords: [
    "agencia BTL Chile",
    "activaciones de marca Chile",
    "eventos corporativos Chile",
    "promotores Chile",
    "staff promocional Chile",
    "producción de eventos Chile",
  ],
  openGraph: {
    title: "Baluna — Agencia BTL, activaciones y staff promocional en Chile",
    description:
      "Hacemos que las marcas pasen de verse a vivirse. Activaciones BTL, eventos, lanzamientos y equipos de staff en todo Chile.",
    url: siteUrl,
    siteName: "Baluna",
    locale: "es_CL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Baluna — Agencia BTL en Chile",
    description:
      "Activaciones BTL, eventos, lanzamientos y staff promocional. Operación nacional.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={`${fraunces.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
