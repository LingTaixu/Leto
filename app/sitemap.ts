import type { MetadataRoute } from "next";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getSiteUrl } from "@/lib/site-url";
import { getPosts } from "@/lib/posts";

const STATIC_SEGMENTS = [
  "",
  "/about",
  "/blog",
  "/web3",
  "/web3/notary",
  "/web3/transfer",
  "/web3/kline",
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) return [];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const segment of STATIC_SEGMENTS) {
      entries.push({ url: `${base}/${locale}${segment}` });
    }
    for (const post of getPosts(locale)) {
      entries.push({
        url: `${base}/${locale}/blog/${post.slug}`,
        lastModified: new Date(`${post.date}T00:00:00Z`),
      });
    }
  }

  return entries;
}