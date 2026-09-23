"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";

/**
 * 页脚（design-system §3.1）
 * 简洁两行：版权 + 社交链接
 */
export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-[62.5rem] flex-col items-center gap-2 px-6 py-8 text-sm text-faint md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Leto · {t("footer.copyright")}</p>
        <div className="flex items-center gap-4">
          <LocaleSwitch />
          <Link
            href="https://github.com/LingTaixu"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-accent"
          >
            {t("footer.github")}
          </Link>
          <Link
            href="/rss.xml"
            className="transition-colors duration-150 hover:text-accent"
          >
            {t("footer.rss")}
          </Link>
        </div>
      </div>
    </footer>
  );
}