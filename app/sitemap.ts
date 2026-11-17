import { MetadataRoute } from "next";
import prisma from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thevichaarcouncil.in";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/initiatives`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${baseUrl}/research`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/leadership`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: `${baseUrl}/refund-policy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 }
  ];

  try {
    const [events, publications, initiatives] = await Promise.all([
      prisma.event.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
      prisma.publication.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
      prisma.initiative.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } })
    ]);

    const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
      url: `${baseUrl}/events/${e.slug}`,
      lastModified: e.updatedAt,
      changeFrequency: "daily",
      priority: 0.9
    }));

    const publicationRoutes: MetadataRoute.Sitemap = publications.map((p) => ({
      url: `${baseUrl}/research/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly",
      priority: 0.85
    }));

    const initiativeRoutes: MetadataRoute.Sitemap = initiatives.map((i) => ({
      url: `${baseUrl}/initiatives/${i.slug}`,
      lastModified: i.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8
    }));

    return [...staticRoutes, ...eventRoutes, ...publicationRoutes, ...initiativeRoutes];
  } catch {
    return staticRoutes;
  }
}
