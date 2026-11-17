"use client";

import Image from "next/image";
import Link from "next/link";

export type LogoVariant =
  | "navbar"         // Desktop navbar (46x46)
  | "navbar-compact" // Mobile navbar (38x38)
  | "footer"         // Footer identity (56x56)
  | "auth"           // Authentication & login panels (52x52)
  | "dashboard"      // Portal & Admin sidebars (40x40)
  | "pass"           // Digital pass header (36x36)
  | "pass-large"     // Enlarged pass modal (48x48)
  | "card"           // Event registration header (44x44)
  | "hero"           // Organizational hero branding (80x80)
  | "custom";        // Custom dimension override

export interface VichaarLogoProps {
  variant?: LogoVariant;
  size?: number;
  className?: string;
  priority?: boolean;
  alt?: string;
  withLink?: boolean;
  href?: string;
  dropShadow?: boolean;
}

const VARIANT_DIMENSIONS: Record<LogoVariant, number> = {
  navbar: 46,
  "navbar-compact": 38,
  footer: 56,
  auth: 52,
  dashboard: 40,
  pass: 36,
  "pass-large": 48,
  card: 44,
  hero: 80,
  custom: 48
};

/**
 * Official Vichaar Council Logo Component.
 *
 * Enforces the brand standard:
 * - Single source of truth asset: `/assets/vichaar-logo.png` (transparent circular PNG).
 * - Aspect ratio: 1 / 1.
 * - Object fit: contain.
 * - ZERO artificial borders, background containers, boxes, or frames.
 * - Sits naturally and elegantly on any light or dark background.
 */
export default function VichaarLogo({
  variant = "navbar",
  size,
  className = "",
  priority = false,
  alt = "The Vichaar Council Official Emblem",
  withLink = false,
  href = "/",
  dropShadow = false
}: VichaarLogoProps) {
  const dimension = size || VARIANT_DIMENSIONS[variant];

  const shadowClass = dropShadow
    ? "drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
    : "";

  const imageElement = (
    <Image
      src="/assets/vichaar-logo.png"
      alt={alt}
      width={dimension}
      height={dimension}
      priority={priority || variant === "navbar" || variant === "navbar-compact"}
      className={`aspect-square object-contain shrink-0 select-none ${shadowClass} ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`
      }}
    />
  );

  if (withLink) {
    return (
      <Link
        href={href}
        className="inline-flex items-center shrink-0 group transition-transform duration-300 hover:scale-105 focus:outline-none"
        aria-label={alt}
      >
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}
