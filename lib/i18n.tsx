"use client";

import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "@/lib/locales";
import { resolveMessage, type MessageKey } from "@/lib/messages";

export type { Locale, MessageKey };
export { SUPPORTED_LOCALES, DEFAULT_LOCALE } from "@/lib/locales";

interface I18nContextValue {
  locale: Locale;
  t: (key: MessageKey) => string;
  setLocale: (next: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      t: (key) => resolveMessage(locale, key),
      setLocale: (next) => {
        document.cookie = `locale=${next};path=/;SameSite=Lax`;
        const segments = pathname.split("/");
        segments[1] = next;
        router.replace(segments.join("/") || `/${next}`);
      },
    }),
    [locale, pathname, router],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within <I18nProvider>");
  }
  return ctx;
}