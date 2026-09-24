"use client";

import { LocaleSwitch } from "@/components/LocaleSwitch";
import { useI18n } from "@/lib/i18n";
import Link from "next/link";
import type { SVGProps } from "react";

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
          className="hidden items-center gap-4 md:flex"
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

          <Link
            href="https://github.com/LingTaixu/Leto"
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.github")}
            title={t("nav.github")}
            className="inline-flex size-8 items-center justify-center border-[3px] border-border bg-surface text-muted transition-colors duration-100 hover:bg-accent hover:text-on-accent"
          >
            <GitHubIcon className="size-4" aria-hidden="true" />
          </Link>

          <LocaleSwitch />
        </nav>
      </div>
    </header>
  );
}

/* ---------- 图标（inline SVG，零依赖） ---------- */

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      p-id="1960"
      width="200"
      height="200"
      {...props}
    >
      <path
        d="M511.6 76.3C264.3 76.2 64 276.4 64 523.5 64 718.9 189.3 885 363.8 946c23.5 5.9 19.9-10.8 19.9-22.2v-77.5c-135.7 15.9-141.2-73.9-150.3-88.9C215 726 171.5 718 184.5 703c30.9-15.9 62.4 4 98.9 57.9 26.4 39.1 77.9 32.5 104 26 5.7-23.5 17.9-44.5 34.7-60.8-140.6-25.2-199.2-111-199.2-213 0-49.5 16.3-95 48.3-131.7-20.4-60.5 1.9-112.3 4.9-120 58.1-5.2 118.5 41.6 123.2 45.3 33-8.9 70.7-13.6 112.9-13.6 42.4 0 80.2 4.9 113.5 13.9 11.3-8.6 67.3-48.8 121.3-43.9 2.9 7.7 24.7 58.3 5.5 118 32.4 36.8 48.9 82.7 48.9 132.3 0 102.2-59 188.1-200 212.9 23.5 23.2 38.1 55.4 38.1 91v112.5c0.8 9 0 17.9 15 17.9 177.1-59.7 304.6-227 304.6-424.1 0-247.2-200.4-447.3-447.5-447.3z"
        p-id="1961"
      ></path>
    </svg>
  );
}
