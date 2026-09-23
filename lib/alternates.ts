import { SUPPORTED_LOCALES } from "@/lib/locales";
import { getSiteUrl } from "./site-url";

/**
 * 生成多语言 alternates（canonical + hreflang languages + x-default）。
 * 未配置站点地址时返回 undefined（调用方直接透传给 metadata 即可被忽略）。
 */
export function localeAlternates(
  locale: string,
  pathname: string = "",
): { canonical: string; languages: Record<string, string> } | undefined {
  const base = getSiteUrl();
  if (!base) return undefined;
  const path = pathname === "" ? "" : pathname;

  const languages: Record<string, string> = {
    "x-default": `${base}/zh${path}`,
  };
  for (const l of SUPPORTED_LOCALES) {
    languages[l] = `${base}/${l}${path}`;
  }

  return {
    canonical: `${base}/${locale}${path}`,
    languages,
  };
}