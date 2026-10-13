import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BootSplash } from "@/components/boot/BootSplash";
import { I18nProvider } from "@/lib/i18n";
import {
  SUPPORTED_LOCALES,
  isSupportedLocale,
  type Locale,
} from "@/lib/locales";

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) notFound();

  return (
    <I18nProvider locale={locale as Locale}>
      <BootSplash />
      {children}
    </I18nProvider>
  );
}
