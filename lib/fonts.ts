import { Bodoni_Moda, Cormorant_Garamond, Manrope } from "next/font/google";

export const display = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

export const editorial = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-editorial",
});

export const sans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const hindi = {
  variable: "--font-hindi",
  className: "font-hindi",
};

