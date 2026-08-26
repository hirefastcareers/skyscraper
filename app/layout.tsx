import type { Metadata } from "next";
import { Orbitron, Press_Start_2P, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const pressStart = Press_Start_2P({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Layer 100 — Compete for the Penthouse",
  description:
    "A gamified real-time pixel skyscraper. Bid in GBP, climb 100 floors, and claim Floor 100.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${orbitron.variable} ${pressStart.variable} ${shareTechMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-tower-void text-foreground">
        {children}
      </body>
    </html>
  );
}
