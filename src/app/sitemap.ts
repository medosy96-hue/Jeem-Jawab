import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.PUBLIC_APP_URL ?? "https://jeem-jawab.vercel.app";
  const now = new Date();
  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/create?mode=local`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/create?mode=online`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${base}/join`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
