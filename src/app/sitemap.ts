import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://localhost:3000";

  return [
    { url: base, lastModified: new Date(), priority: 1.0 },
    { url: `${base}/create`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/join`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/admin`, lastModified: new Date(), priority: 0.3 },
  ];
}
