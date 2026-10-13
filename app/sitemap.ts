import type { MetadataRoute } from "next";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getSiteUrl } from "@/lib/site-url";

/**
 * 桌面单页应用：sitemap 收缩为语言入口
 * （子应用为客户端窗口状态，内容通过 ?app= 深链访问，不再单独列出）
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) return [];

  return SUPPORTED_LOCALES.map((locale) => ({
    url: `${base}/${locale}`,
  }));
}
