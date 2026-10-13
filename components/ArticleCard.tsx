"use client";

import { Tag } from "@/components/Tag";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format-date";
import type { Article } from "@/lib/posts";

export type { Article };

/**
 * neubrutalism 文章卡片（桌面窗口版）
 * 1. 3px 硬边框 + 硬阴影（零模糊）+ 零圆角
 * 2. 悬停上浮并放大阴影，按下下压消影
 * 3. 黄色 accent 装饰（置顶徽章 / 标题悬停）
 * 4. 点击整卡回调 onOpen(slug)，不再走路由跳转
 */
export function ArticleCard({
  article,
  onOpen,
}: {
  article: Article;
  onOpen: (slug: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="group relative border-[3px] border-border bg-surface p-5 shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
      <article className="relative">
        {/* 标签行 */}
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
          {article.pinned && (
            <span className="border-2 border-border bg-accent px-2 py-0.5 font-mono text-xs font-bold text-on-accent shadow-neu-sm">
              {t("blog.pinned")}
            </span>
          )}
        </div>

        {/* 标题（整卡可点：button after 绝对定位覆盖） */}
        <h3 className="text-base font-semibold tracking-tight text-text transition-colors duration-100 group-hover:bg-accent group-hover:text-on-accent">
          <button
            type="button"
            onClick={() => onOpen(article.slug)}
            className="cursor-pointer text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {article.title}
          </button>
        </h3>

        {/* 摘要 */}
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
          {article.summary}
        </p>

        {/* 元信息 */}
        <p className="mt-4 flex items-center gap-2 text-xs text-faint">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {article.readMin} {t("blog.readMin")}
          </span>
        </p>
      </article>
    </div>
  );
}
