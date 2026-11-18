import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/api/**/*": ["./prisma/dev.db", "./prisma/schema.prisma", "./dev.db"],
    "/**/*": ["./prisma/dev.db", "./prisma/schema.prisma", "./dev.db"]
  },
  experimental: {
    cpus: 1,
    optimizePackageImports: ["lucide-react", "framer-motion"]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" }
    ]
  },
  async rewrites() {
    return [
      { source: "/privacy", destination: "/privacy-policy" },
      { source: "/terms-and-conditions", destination: "/terms" },
      { source: "/founders/profile", destination: "/admin/founders/profile" },
      { source: "/founders/automation", destination: "/admin/founders/automation" },
      { source: "/founders/changelog", destination: "/admin/founders/changelog" },
      { source: "/founders/settings", destination: "/admin/settings" },
      { source: "/founders/registrations", destination: "/admin/registrations" },
      { source: "/founders/payments", destination: "/admin/payments" },
      { source: "/founders/enquiries", destination: "/admin/enquiries" },
      { source: "/founders/events", destination: "/admin/events" },
      { source: "/founders/:section/:subpath*", destination: "/admin/:section/:subpath*" }
    ];
  }
};

export default nextConfig;
