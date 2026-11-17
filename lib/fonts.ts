import { Bodoni_Moda, Cormorant_Garamond, Manrope } from "next/font/google";

export const display = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

export const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-editorial",
});

export const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

// Noto Serif Devanagari has a known Turbopack internal query assertion bug in Next.js 16
// ('next/font/google queries have exactly one entry').
// It is loaded via the Google Fonts @import in app/globals.css and styled via .font-hindi.
export const hindi = {
  variable: "--font-hindi",
  className: "font-hindi",
};
