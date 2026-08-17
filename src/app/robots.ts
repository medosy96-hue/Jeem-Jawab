import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.PUBLIC_APP_URL ?? "https://jeem-jawab.vercel.app";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/join", "/create"],
        disallow: ["/admin", "/api/", "/host/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
