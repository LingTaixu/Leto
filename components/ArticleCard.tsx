import Link from "next/link";
import type { ReactNode } from "react";
import type { Article } from "@/lib/posts";
import { formatDate } from "@/lib/posts";
import { Tag } from "@/components/Tag";
import { type Locale } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";

export type { Article };

/**
 * Gemini 风格动态流光边框文章卡片 (Gemini Border-Only Rotation)
 * 特色：
 * 1. 采用“三层遮罩裁剪”设计模型，边框旋转，内部背景与文字完全静态，零漏光
 * 2. 精准的 1.5px 边框厚度与圆角比例补偿计算
 * 3. 悬停微上浮、流光旋转速度加快、底部淡入霓虹氛围投影 (Ambient Halo)
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
    <div className="gemini-border-container group">
      {/* 1. 旋转的流光盘（只充当 Padding 1.5px 处的旋转背景） */}
      <div className="gemini-border-orbit" aria-hidden="true" />

      {/* 2. 静态不透光底盒（保护文字，完全静止，消除中央漏光） */}
      <div className="gemini-border-content p-6">
        {/* 建立卡片级的焦点区域 */}
        <article className="relative focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 focus-within:ring-offset-bg rounded-lg">
          {/* 标签行 */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {article.tags.map((tag) => (
              <Tag key={tag} name={tag} className="relative z-20" />
            ))}
            {article.pinned && (
              <span className="relative z-20 rounded-full bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                {t("blog.pinned")}
              </span>
            )}
          </div>

          {/* 标题（整卡可点：after 绝对定位覆盖，z-10） */}
          <h3 className="text-lg font-bold tracking-tight text-text transition-colors duration-150 group-hover:text-accent">
            <Link
              href={`/${locale}/blog/${article.slug}`}
              className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:rounded-xl"
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