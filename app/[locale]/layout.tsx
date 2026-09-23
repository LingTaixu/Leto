import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import type { ReactNode } from "react";
import { BackToTop } from "@/components/BackToTop";
import { BootSplash } from "@/components/boot/BootSplash";
import { Footer } from "@/components/Footer";
import { Navigate } from "@/components/Navigate";
import { TabBar } from "@/components/TabBar";
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
      <Navigate />
      <ViewTransition>{children}</ViewTransition>
      <Footer />
      <BackToTop />
      <TabBar />
    </I18nProvider>
  );
}