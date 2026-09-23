"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LocaleSwitch } from "@/components/LocaleSwitch";

const LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/blog", key: "nav.blog" },
  { href: "/web3", key: "nav.web3" },
  { href: "/about", key: "nav.about" },
] as const;

/**
 * 桌面端 Header（neubrutalism）
 * 白底 + 4px 黑色底边框；md 以上完整展示；移动端仅保留品牌行（导航交给 Tab 条）
 */
export function Navigate() {
  const { t, locale } = useI18n();

  return (
    <header className="sticky top-0 z-40 h-14 border-b-[4px] border-border bg-surface">
      <div className="mx-auto flex h-full w-full max-w-[62.5rem] items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="font-display text-lg font-extrabold tracking-tight text-text hover:bg-accent hover:text-on-accent"
        >
          Leto
        </Link>

        {/* 桌面导航：md+ 显示；移动端隐藏（设计规范 md 起） */}
        <nav
          aria-label={t("nav.main")}
          className="hidden items-center gap-6 md:flex"
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={`/${locale}${link.href !== "/" ? link.href : ""}`}
              className="text-sm font-medium text-text transition-colors duration-100 hover:bg-accent hover:text-on-accent"
            >
              {t(link.key)}
            </Link>
          ))}

          <LocaleSwitch />
        </nav>
      </div>
    </header>
  );
}