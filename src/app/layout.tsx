import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { BackdropLoader } from "@/components/three/BackdropLoader";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

// Variable names are --font-ui and --font-num on purpose. The card textures read them by name.
const ui = Space_Grotesk({ variable: "--font-ui", subsets: ["latin"], display: "swap" });
const num = JetBrains_Mono({ variable: "--font-num", subsets: ["latin"], display: "swap" });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DESCRIPTION =
  "Learn how card numbers are checked before a bank ever sees them. Type a number into a 3D card and watch the brand, length and Luhn checksum validate live, in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "CardCheck · Learn how card numbers are validated", template: "%s · CardCheck" },
  description: DESCRIPTION,
  applicationName: "CardCheck",
  keywords: ["Luhn algorithm", "credit card validation", "card number", "IIN", "BIN", "debit card", "frontend validation"],
  openGraph: {
    title: "CardCheck · Learn how card numbers are validated",
    description: DESCRIPTION,
    type: "website",
    siteName: "CardCheck",
  },
  twitter: { card: "summary", title: "CardCheck", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: "#07090f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${ui.variable} ${num.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
        >
          Skip to content
        </a>
        <BackdropLoader />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
