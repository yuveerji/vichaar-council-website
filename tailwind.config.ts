import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Official primary accent tokens (The Vichaar Council Brand Colour System)
        citrus: {
          DEFAULT: "#FFA62B", // Citrus Zest - Primary accent, active CTAs, warm highlights
          hover: "#E89520",
          light: "#FFF4E3"
        },
        seabreeze: {
          DEFAULT: "#8CC5FF", // Sea Breeze - Cool atmospheric tint, interactive states
          light: "#E1EFFF",
          dark: "#5E9FE0"
        },
        amalfi: {
          DEFAULT: "#2E5AA7", // Amalfi Tile - Deep editorial blue, secondary links & badges
          dark: "#1E3D75",
          light: "#4B76C4"
        },
        gelato: {
          DEFAULT: "#F8E6A0", // Cream Gelato - Warm light highlights, soft parchment glow
          light: "#FDF9EA"
        },
        // Complementary brand tokens
        navy: {
          DEFAULT: "#070E1A", // Midnight Navy - Primary hero & cinematic dark background
          deep: "#070E1A",
          surface: "#101827",
          border: "#1C2738"
        },
        ink: {
          DEFAULT: "#03060C", // Obsidian Black - Deep shadow gradient & podium stone base
          light: "#070E1A"
        },
        crimson: {
          DEFAULT: "#B3191B", // Crimson Revolution - Display accent, starburst & diagonals
          dark: "#8F161A",
          light: "#D83A40"
        },
        parchment: {
          DEFAULT: "#EAD8C3", // Archival Parchment - Editorial paper backdrop & display ivory
          soft: "#F4EADC",
          dark: "#DFCDAF"
        },
        antiquegold: {
          DEFAULT: "#C9A255", // Antique Gold - Pillar iconography, ornamental dividers & CTA border
          hover: "#B89144",
          light: "#E5CCA0"
        },
        warmwhite: {
          DEFAULT: "#FFFDF8",
          card: "#FFFFFF"
        },
        mutedgrey: {
          DEFAULT: "#A5A8AD",
          dark: "#72767D",
          light: "#D3D5D9"
        },
        charcoal: {
          DEFAULT: "#20232A",
          soft: "#2E333D",
          deep: "#15181D"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Bodoni Moda", "Playfair Display", "Georgia", "serif"],
        editorial: ["var(--font-editorial)", "Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Manrope", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        hindi: ["var(--font-hindi)", "Noto Serif Devanagari", "serif"],
        royal: ["var(--font-display)", "Bodoni Moda", "Cinzel", "Georgia", "serif"],
        serif: ["var(--font-display)", "Bodoni Moda", "Cormorant Garamond", "Georgia", "serif"]
      },
      boxShadow: {
        editorial: "0 20px 40px -15px rgba(8, 11, 16, 0.08)",
        "editorial-lg": "0 25px 60px -15px rgba(8, 11, 16, 0.16)",
        card: "0 4px 20px -2px rgba(16, 24, 39, 0.06)",
        gold: "0 0 25px -5px rgba(255, 166, 43, 0.25)"
      }
    }
  },
  plugins: []
};

export default config;
