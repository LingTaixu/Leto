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
    title: t("transfer.seoTitle"),
    description: t("transfer.seoDescription"),
    alternates: localeAlternates(locale, "/web3/transfer"),
  };
}

export default function TransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}