import Link from "next/link";
import type { Metadata } from "next";
import { localeAlternates } from "@/lib/alternates";
import { type Locale } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";
import { web3Features } from "./features";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  return {
    title: t("web3.seoTitle"),
    description: t("web3.seoDescription"),
    alternates: localeAlternates(locale, "/web3"),
  };
}

export default async function Web3Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-8">
        <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent">{"// "}{t("web3.kicker")}</p>
        <h1 className="mt-2 font-bold tracking-tight text-text">
          {t("web3.title")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("web3.desc")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {web3Features.map((feature) => (
          <Link
            key={feature.slug}
            href={`/${locale}/web3/${feature.slug}`}
            className="group flex flex-col border-[3px] border-border bg-surface p-5 shadow-neu transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg"
          >
            <div className="flex items-start justify-between">
              <span className="border-[3px] border-border bg-accent px-2 py-0.5 font-mono text-xs font-bold text-on-accent">
                {feature.badge}
              </span>
              <span
                aria-hidden="true"
                className="text-faint transition-colors duration-200 group-hover:text-text"
              >
                →
              </span>
            </div>
            <h2 className="mt-4 text-lg font-bold tracking-tight text-text transition-colors duration-150 group-hover:bg-accent group-hover:text-on-accent">
              {t(feature.titleKey)}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t(feature.descKey)}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}