import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleCard";
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
    title: t("blog.seoTitle"),
    description: t("blog.seoDescription"),
    alternates: localeAlternates(locale, "/blog"),
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  const articles = getPosts(locale as Locale);

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <h1 className="text-3xl font-bold tracking-tight text-text">
        {t("blog.title")}
      </h1>
      <p className="mt-2 text-base text-muted">{t("blog.subtitle")}</p>
      <div className="mt-8">
        <ArticleList articles={articles} locale={locale} />
      </div>
    </main>
  );
}