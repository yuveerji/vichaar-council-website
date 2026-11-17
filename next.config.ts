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
  }
};

export default nextConfig;
