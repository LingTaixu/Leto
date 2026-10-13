"use client";

import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format-date";
import { useDesktopData } from "../DesktopData";
import { useWindowManager } from "../WindowManager";

/**
 * 首页窗口（Welcome / README）
 * 原首页 hero + 最新文章入口；点击文章打开博客窗口深链
 */
export function HomeApp() {
  const { t } = useI18n();
  const { articles } = useDesktopData();
  const wm = useWindowManager();
  const recent = articles.slice(0, 4);

  return (
    <div className="p-4 lg:p-8">
      <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent shadow-neu-sm">
        {t("home.hello")}
      </p>
      <h2 className="mt-3 font-bold tracking-tight text-text">
        {t("home.title")}
      </h2>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        {t("home.desc")}{" "}
        <button
          type="button"
          onClick={() => wm.open("about")}
          className="cursor-pointer text-text underline underline-offset-2 transition-colors duration-150 hover:bg-accent hover:text-on-accent"
        >
          {t("home.viewResume")}
        </button>
        。
      </p>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold tracking-tight text-text">
            {t("home.caseStudies")}
          </h3>
          <button
            type="button"
            onClick={() => wm.open("blog")}
            className="cursor-pointer text-sm text-muted transition-colors duration-150 hover:bg-accent hover:text-on-accent"
          >
            {t("home.all")} →
          </button>
        </div>
        <ul className="space-y-2">
          {recent.map((article) => (
            <li key={article.slug}>
              <button
                type="button"
                onClick={() => wm.open("blog", { slug: article.slug })}
                className="group flex w-full cursor-pointer items-center justify-between gap-3 border-[3px] border-border bg-surface px-4 py-3 text-left shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                  {article.title}
                </span>
                <span className="shrink-0 font-mono text-xs text-faint group-hover:text-on-accent">
                  {formatDate(article.date)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
