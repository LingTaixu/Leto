import Link from "next/link";
import type { ReactNode } from "react";
import type { Article } from "@/lib/posts";
import { formatDate } from "@/lib/posts";
import { Tag } from "@/components/Tag";
import { type Locale } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";

export type { Article };

/**
 * neubrutalism 文章卡片
 * 1. 3px 硬边框 + 5px 硬阴影（零模糊）+ 零圆角
 * 2. 悬停上浮 2px 并放大阴影，按下下压消影
 * 3. 黄色 accent 装饰（置顶徽章 / 标题悬停）
 * 4. 完整的键盘 focus 支持 (focus-within)
 */
export function ArticleCard({
  article,
  locale,
}: {
  article: Article;
  locale: string;
}) {
  const t = (key: string) => resolveMessage(locale as Locale, key);
  return (
    <div className="group border-[3px] border-border bg-surface p-6 shadow-neu transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-neu-sm">
      {/* 建立卡片级的焦点区域 */}
      <article className="relative focus-within:outline-3 focus-within:outline-accent focus-within:outline-offset-4">
        {/* 标签行 */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} name={tag} className="relative z-20" />
          ))}
          {article.pinned && (
            <span className="relative z-20 border-2 border-border bg-accent px-2.5 py-1 font-mono text-xs font-bold text-on-accent shadow-neu-sm">
              {t("blog.pinned")}
            </span>
          )}
        </div>

        {/* 标题（整卡可点：after 绝对定位覆盖，z-10） */}
        <h3 className="text-lg font-heading font-bold tracking-tight text-text transition-colors duration-100 group-hover:bg-accent group-hover:text-on-accent">
          <Link
            href={`/${locale}/blog/${article.slug}`}
            className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none"
          >
            {article.title}
          </Link>
        </h3>

        {/* 摘要 */}
        <p className="mt-2.5 line-clamp-2 text-base leading-relaxed text-muted">
          {article.summary}
        </p>

        {/* 元信息 */}
        <p className="mt-5 flex items-center gap-2 text-sm text-faint">
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

/** 文章列表栅格容器 */
export function ArticleList({
  articles,
  locale,
  children,
}: {
  articles: Article[];
  locale: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
      {articles.map((article) => (
        <ArticleCard key={article.slug} article={article} locale={locale} />
      ))}
      {children}
    </div>
  );
}