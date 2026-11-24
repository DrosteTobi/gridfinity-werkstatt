import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Teko } from "next/font/google";
import "./globals.css";

const teko = Teko({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-teko",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gridfinity Werkstatt — Drawer Configurator",
  description:
    "Plan Gridfinity drawer layouts, build a bill of materials, and submit orders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${teko.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}
        style={
          {
            "--font-display": "var(--font-teko), sans-serif",
            "--font-body": "var(--font-plex-sans), sans-serif",
            "--font-mono": "var(--font-plex-mono), monospace",
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
