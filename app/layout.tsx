import type { Metadata, Viewport } from "next";
import "./globals.css";
import AppShell from "@/components/layout/AppShell";
import { display, editorial, sans, hindi } from "@/lib/fonts";

export const viewport: Viewport = {
  themeColor: "#101827",
  width: "device-width",
  initialScale: 1
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "The Vichaar Council | Where Ideas Earn Their Weight",
    template: "%s | The Vichaar Council"
  },
  description:
    "An independent youth-led intellectual institution dedicated to rigorous debate, constitutional inquiry, policy research, and diplomacy across India.",
  keywords: [
    "The Vichaar Council",
    "Vichaar Council",
    "Debate India",
    "Parliamentary Simulation",
    "Youth Leadership",
    "Public Policy Research",
    "Diplomatic Conclave",
    "Constitutional Law"
  ],
  authors: [{ name: "The Vichaar Council Secretariat" }],
  creator: "The Vichaar Council",
  publisher: "The Vichaar Council",
  icons: {
    icon: "/assets/vichaar-logo.png",
    apple: "/assets/vichaar-logo.png"
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://thevichaarcouncil.in",
    title: "The Vichaar Council | Where Ideas Earn Their Weight",
    description:
      "An independent youth-led intellectual institution dedicated to rigorous debate, constitutional inquiry, policy research, and diplomacy across India.",
    siteName: "The Vichaar Council",
    images: [
      {
        url: "/assets/vichaar-logo.png",
        width: 800,
        height: 800,
        alt: "The Vichaar Council Official Emblem"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "The Vichaar Council | Where Ideas Earn Their Weight",
    description:
      "An independent youth-led intellectual institution dedicated to rigorous debate, constitutional inquiry, policy research, and diplomacy across India.",
    images: ["/assets/vichaar-logo.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${editorial.variable} ${sans.variable} ${hindi.variable}`}
    >
      <body className={`${sans.className} font-sans bg-warmwhite text-charcoal antialiased relative`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
