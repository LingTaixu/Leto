import type { Metadata } from "next";
import { localeAlternates } from "@/lib/alternates";
import { resolveMessage } from "@/lib/messages";
import type { Locale } from "@/lib/locales";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  return {
    title: t("notary.seoTitle"),
    description: t("notary.seoDescription"),
    alternates: localeAlternates(locale, "/web3/notary"),
  };
}

export default function NotaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}