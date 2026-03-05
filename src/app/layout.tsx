import type { Metadata } from "next";
import { Cinzel, Crimson_Text, Barlow_Condensed } from "next/font/google";
import Masthead from "@/components/layout/masthead";
import NavBar from "@/components/layout/nav-bar";
import Footer from "@/components/layout/footer";
import "./globals.css";

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
  title: "UNN — Underworld News Network",
  description: "All the news that's unfit for daylight.",
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
      </body>
    </html>
  );
}
