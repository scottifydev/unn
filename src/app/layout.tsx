import type { Metadata } from "next";
import { Cinzel, Crimson_Text, Barlow_Condensed } from "next/font/google";
import Masthead from "@/components/layout/masthead";
import NavBar from "@/components/layout/nav-bar";
import Footer from "@/components/layout/footer";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { AuthListener } from "@/components/auth/auth-listener";
import "./globals.css";

const BASE_URL = "https://underworldnewsnetwork.org";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const crimson = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "UNN — Underworld News Network",
    template: "%s | UNN — Underworld News Network",
  },
  description: "All the news that's unfit for daylight.",
  keywords: [
    "underworld news",
    "supernatural news",
    "vampire affairs",
    "occult markets",
    "demon politics",
    "UNN",
  ],
  authors: [{ name: "Underworld News Network" }],
  creator: "Underworld News Network",
  publisher: "Underworld News Network",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Underworld News Network",
    title: "UNN — Underworld News Network",
    description: "All the news that's unfit for daylight.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UNN — Underworld News Network",
    description: "All the news that's unfit for daylight.",
  },
  alternates: {
    canonical: BASE_URL,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${cinzel.variable} ${crimson.variable} ${barlow.variable} font-crimson`}
      >
        <Masthead />
        <NavBar />
        {children}
        <Footer />
        <AuthListener />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
