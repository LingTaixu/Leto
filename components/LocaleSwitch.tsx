"use client";

import { useI18n } from "@/lib/i18n";

/**
 * 语言切换器：在 zh/en 间切换，写 cookie 并导航到对应 locale 当前页
 */
export function LocaleSwitch() {
  const { locale, setLocale } = useI18n();
  const next = locale === "zh" ? "en" : "zh";

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={next === "zh" ? "切换到中文" : "Switch to English"}
      title={locale === "zh" ? "English" : "中文"}
      className="inline-flex h-8 items-center justify-center rounded-full border border-border/80 bg-surface px-3 font-mono text-xs text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
    >
      {locale === "zh" ? "EN" : "中文"}
    </button>
  );
}