"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";

/**
 * 页脚（neubrutalism）
 * 黑底 + 4px 黄色顶部分割线，链接黄色高亮
 */
export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t-[4px] border-border bg-black text-white">
      <div className="mx-auto flex w-full max-w-[62.5rem] flex-col items-center gap-2 px-6 py-8 text-sm md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Leto · {t("footer.copyright")}</p>
        <div className="flex items-center gap-4">
          <LocaleSwitch />
          <Link
            href="https://github.com/LingTaixu"
            target="_blank"
            rel="noreferrer"
            className="text-accent transition-colors duration-100 hover:bg-accent hover:text-on-accent"
          >
            {t("footer.github")}
          </Link>
          <Link
            href="/rss.xml"
            className="text-accent transition-colors duration-100 hover:bg-accent hover:text-on-accent"
          >
            {t("footer.rss")}
          </Link>
        </div>
      </div>
    </footer>
  );
}