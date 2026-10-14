import type { Metadata, Viewport } from "next";
import { Bungee_Shade, Geist, Geist_Mono, Monoton, Rubik_Wet_Paint } from "next/font/google";
import { BackToTop } from "@/components/ui/back-to-top";
import { SITE } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The typefaces for the hero word (Settings > Hero). Except the default, `preload: false`: they
// are only downloaded when somebody picks one.
const heroNeon = Monoton({
  variable: "--font-hero-neon",
  weight: "400",
  preload: false,
});

// Drip is the default, so it is preloaded; the others wait until somebody picks them.
const heroDrip = Rubik_Wet_Paint({
  variable: "--font-hero-drip",
  weight: "400",
  subsets: ["latin"],
});

const heroBlock = Bungee_Shade({
  variable: "--font-hero-block",
  weight: "400",
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: SITE.title,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
};

export const viewport: Viewport = {
  themeColor: "#09090e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${heroNeon.variable} ${heroDrip.variable} ${heroBlock.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <BackToTop />
      </body>
    </html>
  );
}
