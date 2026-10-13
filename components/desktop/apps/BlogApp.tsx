"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Pagination } from "@/components/Pagination";
import { Prose } from "@/components/Prose";
import { Tag } from "@/components/Tag";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/format-date";
import type { Article } from "@/lib/posts";
import { useDesktopData } from "../DesktopData";
import type { AppContentProps } from "../registry";

const PAGE_SIZE = 5;

/**
 * 博客窗口：列表 ↔ 详情 二级视图
 * 深链 params.slug 直接进详情；返回保持之前的分页位置
 */
export function BlogApp({ params, setParams }: AppContentProps) {
  const { articles } = useDesktopData();
  const slug = params.slug ?? null;
  const [page, setPage] = useState(1);

  const article = slug
    ? articles.find((a) => a.slug === slug)
    : undefined;

  // slug 深链无效时回落列表
  useEffect(() => {
    if (slug && !article) setParams({});
  }, [slug, article, setParams]);

  if (slug && article) {
    return (
      <ArticleDetail
        article={article}
        articles={articles}
        onBack={() => setParams({})}
        onNavigate={(s) => setParams({ slug: s })}
      />
    );
  }
  if (slug && !article) return null;

  return (
    <ArticleListView
      articles={articles}
      page={page}
      onPage={setPage}
      onOpen={(s) => setParams({ slug: s })}
    />
  );
}

/* ---------- 列表视图 ---------- */

function ArticleListView({
  articles,
  page,
  onPage,
  onOpen,
}: {
  articles: Article[];
  page: number;
  onPage: (p: number) => void;
  onOpen: (slug: string) => void;
}) {
  const { t } = useI18n();
  const totalPages = Math.max(1, Math.ceil(articles.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const items = useMemo(
    () => articles.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE),
    [articles, current],
  );
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    topRef.current?.scrollTo({ top: 0 });
  }, [current]);

  return (
    <div ref={topRef} className="h-full overflow-y-auto p-4 lg:p-6">
      <h2 className="font-bold tracking-tight text-text">{t("blog.title")}</h2>
      <p className="mt-1 text-sm text-muted">{t("blog.subtitle")}</p>

      <div className="mt-5 space-y-4">
        {items.map((article) => (
          <ArticleCard key={article.slug} article={article} onOpen={onOpen} />
        ))}
        {items.length === 0 && (
          <p className="py-8 text-center font-mono text-sm text-faint">
            {t("common.empty")}
          </p>
        )}
      </div>

      <Pagination page={current} totalPages={totalPages} onPage={onPage} />
    </div>
  );
}

/* ---------- 详情视图 ---------- */

function ArticleDetail({
  article,
  articles,
  onBack,
  onNavigate,
}: {
  article: Article;
  articles: Article[];
  onBack: () => void;
  onNavigate: (slug: string) => void;
}) {
  const { t } = useI18n();
  const index = articles.findIndex((a) => a.slug === article.slug);
  const prev = index > 0 ? articles[index - 1] : undefined; // 按日期倒序
  const next = index < articles.length - 1 ? articles[index + 1] : undefined;

  return (
    <div className="p-4 lg:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex cursor-pointer items-center border-[3px] border-border bg-surface px-3 py-1.5 font-mono text-xs font-bold text-text shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:text-on-accent hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        ← {t("blog.subtitle")}
      </button>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {article.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
        <h2 className="font-bold tracking-tight text-text">{article.title}</h2>
        <p className="mt-3 flex items-center gap-2 text-sm text-faint">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {article.readMin} {t("blog.readMin")}
          </span>
        </p>
      </header>

      <article className="mt-6 max-w-[68ch]">
        {article.content ? (
          <Prose html={article.content} />
        ) : (
          <p className="py-8 text-center font-mono text-sm text-faint">
            {t("common.empty")}
          </p>
        )}
      </article>

      <nav
        aria-label="article-nav"
        className="mt-12 grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2"
      >
        <PostNavLink post={next} prefix={t("blog.next")} onNavigate={onNavigate} />
        <PostNavLink
          post={prev}
          prefix={t("blog.prev")}
          onNavigate={onNavigate}
          alignEnd
        />
      </nav>
    </div>
  );
}

function PostNavLink({
  post,
  prefix,
  onNavigate,
  alignEnd = false,
}: {
  post?: Article;
  prefix: string;
  onNavigate: (slug: string) => void;
  alignEnd?: boolean;
}) {
  if (!post) {
    return <div className="border-[3px] border-dashed border-border p-4" />;
  }
  return (
    <button
      type="button"
      onClick={() => onNavigate(post.slug)}
      className={`group block cursor-pointer border-[3px] border-border bg-surface p-4 text-left shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:shadow-neu ${
        alignEnd ? "sm:text-right" : ""
      }`}
    >
      <span className="block text-xs font-bold text-faint">{prefix}</span>
      <span className="mt-1 block text-sm font-medium text-text transition-colors duration-150 group-hover:text-on-accent">
        {post.title}
      </span>
    </button>
  );
}
