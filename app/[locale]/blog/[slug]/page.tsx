import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { Tag } from "@/components/Tag";
import { localeAlternates } from "@/lib/alternates";
import { type Locale } from "@/lib/locales";
import { SUPPORTED_LOCALES } from "@/lib/locales";
import { resolveMessage } from "@/lib/messages";
import { formatDate, getAllSlugs, getPostBySlug, getPosts } from "@/lib/posts";
import type { Article } from "@/lib/posts";

type PostProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.flatMap((locale) =>
    getAllSlugs(locale).map((slug) => ({ locale, slug })),
  );
}

export function generateMetadata({ params }: PostProps): Promise<Metadata> {
  return params.then(({ locale, slug }) => {
    const post = getPostBySlug(slug, locale);
    if (!post) return {};
    return {
      title: post.title,
      description: post.summary,
      openGraph: {
        title: post.title,
        description: post.summary,
        type: "article",
      },
      alternates: localeAlternates(locale, `/blog/${slug}`),
    };
  });
}

export default async function BlogPostPage({ params }: PostProps) {
  const { locale, slug } = await params;
  const t = (key: string) => resolveMessage(locale as Locale, key);
  const post = getPostBySlug(slug, locale);
  if (!post || !post.content) notFound();

  const posts = getPosts(locale);
  const index = posts.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? posts[index - 1] : undefined; // 索引按日期倒序
  const next = index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <nav
        aria-label="breadcrumb"
        className="mb-8 text-sm text-faint"
      >
        <Link
          href={`/${locale}`}
          className="transition-colors duration-150 hover:bg-accent hover:text-on-accent"
        >
          {t("nav.home")}
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link
          href={`/${locale}/blog`}
          className="transition-colors duration-150 hover:bg-accent hover:text-on-accent"
        >
          {t("nav.blog")}
        </Link>
      </nav>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
        <h1 className="font-bold tracking-tight text-text">
          {post.title}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>
            {post.readMin} {t("blog.readMin")}
          </span>
        </p>
      </header>

      <article className="mt-8">
        <Prose html={post.content} />
      </article>

      {/* Prev / Next 导航 */}
      <nav
        aria-label="article-nav"
        className="mt-16 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
      >
        <PostNavLink locale={locale} post={next} prefix={t("blog.next")} />
        <PostNavLink
          locale={locale}
          post={prev}
          prefix={t("blog.prev")}
          alignEnd
        />
      </nav>
    </main>
  );
}

function PostNavLink({
  locale,
  post,
  prefix,
  alignEnd = false,
}: {
  locale: string;
  post?: Article;
  prefix: string;
  alignEnd?: boolean;
}) {
  if (!post) {
    return (
      <div className="border-[3px] border-dashed border-border p-4" />
    );
  }
  return (
    <Link
      href={`/${locale}/blog/${post.slug}`}
      className={`group block border-[3px] border-border bg-surface p-4 shadow-neu-sm transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-accent hover:shadow-neu ${
        alignEnd ? "sm:text-right" : ""
      }`}
    >
      <span className="block text-xs font-bold text-faint">{prefix}</span>
      <span className="mt-1 block text-sm font-medium text-text transition-colors duration-150 group-hover:text-on-accent">
        {post.title}
      </span>
    </Link>
  );
}