import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const rules = { userAgent: "*", allow: "/" };
  const siteUrl = getSiteUrl();
  if (!siteUrl) return { rules };
  return {
    rules,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}