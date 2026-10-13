import type { Metadata } from "next";
import { Desktop } from "@/components/desktop/Desktop";
import { localeAlternates } from "@/lib/alternates";
import { type Locale } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";
import { getPosts } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  return {
    title: t("home.seoTitle"),
    description: t("home.seoDescription"),
    alternates: localeAlternates(locale, ""),
  };
}

/**
 * 桌面入口（单页桌面应用）
 * server 端读取全部文章（含正文 HTML）注入 client 桌面；
 * 子应用通过 ?app=<id>&slug=<slug> 深链唤起
 */
export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const articles = getPosts(locale as Locale);

  return <Desktop locale={locale as Locale} articles={articles} />;
}
