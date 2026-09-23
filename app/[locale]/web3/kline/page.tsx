import { KlineView } from "@/components/kline/KlineView";
import { localeAlternates } from "@/lib/alternates";
import type { Locale } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";
import type { Metadata } from "next";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  return {
    title: t("kline.seoTitle"),
    description: t("kline.seoDescription"),
    alternates: localeAlternates(locale, "/web3/kline"),
  };
}

export default function KlinePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-[140rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
          <p className="py-6 text-center font-mono text-sm text-faint">
            Loading
          </p>
        </main>
      }
    >
      <KlineView />
    </Suspense>
  );
}
