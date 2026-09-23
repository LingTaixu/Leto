import Link from "next/link";
import type { Metadata } from "next";
import { ArticleList } from "@/components/ArticleCard";
import { Marquee } from "@/components/Marquee";
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

/** 首页跑马灯技能列表 */
const SKILLS = [
  "React",
  "Next.js",
  "Vue 3",
  "TypeScript",
  "Tailwind CSS",
  "Web3",
  "Ethereum",
  "Hyperliquid",
  "Polymarket",
  "DEX",
  "EVM",
  "React Query",
  "Wagmi",
  "Three.js",
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  const articles = getPosts(locale as Locale);

  return (
    <>
      <Marquee skills={SKILLS} />
      <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
        <section className="mb-12">
          <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent shadow-neu-sm">{t("home.hello")}</p>
          <h1 className="mt-3 font-bold tracking-tight text-text">
            {t("home.title")}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            {t("home.desc")}
            <Link
              href={`/${locale}/about`}
              className="text-text underline underline-offset-2 hover:bg-accent hover:text-on-accent transition-colors duration-150"
            >
              {t("home.viewResume")}
            </Link>
            。
          </p>
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-semibold tracking-tight text-text">
              {t("home.caseStudies")}
            </h2>
            <Link
              href={`/${locale}/blog`}
              className="text-sm text-muted transition-colors duration-150 hover:bg-accent hover:text-on-accent"
            >
              {t("home.all")} →
            </Link>
          </div>
          <ArticleList articles={articles} locale={locale} />
        </section>
      </main>
    </>
  );
}
