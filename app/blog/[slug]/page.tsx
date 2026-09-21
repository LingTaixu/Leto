import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Prose } from "@/components/Prose";
import { Tag } from "@/components/Tag";
import { formatDate, getPostBySlug, getPosts } from "@/lib/posts";
import type { Article } from "@/lib/posts";

type PostProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPosts().map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: PostProps): Promise<Metadata> {
  return params.then(({ slug }) => {
    const post = getPostBySlug(slug);
    if (!post) return {};
    return {
      title: post.title,
      description: post.summary,
    };
  });
}

export default async function BlogPostPage({ params }: PostProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post || !post.content) notFound();

  const posts = getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const prev = index > 0 ? posts[index - 1] : undefined; // 索引按日期倒序
  const next = index < posts.length - 1 ? posts[index + 1] : undefined;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 pb-28 lg:pb-10">
      <nav
        aria-label="面包屑"
        className="mb-8 text-sm text-faint"
      >
        <Link
          href="/"
          className="transition-colors duration-150 hover:text-accent"
        >
          Home
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <Link
          href="/blog"
          className="transition-colors duration-150 hover:text-accent"
        >
          Blog
        </Link>
      </nav>

      <header>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {post.tags.map((tag) => (
            <Tag key={tag} name={tag} />
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text lg:text-4xl">
          {post.title}
        </h1>
        <p className="mt-3 flex items-center gap-2 text-sm text-faint">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readMin} min read</span>
        </p>
      </header>

      <article className="mt-8">
        <Prose html={post.content} />
      </article>

      {/* Prev / Next 导航 */}
      <nav
        aria-label="文章导航"
        className="mt-16 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-2"
      >
        <PostNavLink post={next} prefix="上一篇" />
        <PostNavLink post={prev} prefix="下一篇" alignEnd />
      </nav>
    </main>
  );
}

function PostNavLink({
  post,
  prefix,
  alignEnd = false,
}: {
  post?: Article;
  prefix: string;
  alignEnd?: boolean;
}) {
  if (!post) {
    return (
      <div className="rounded-lg border border-border/60 p-4" />
    );
  }
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={`group rounded-lg border border-border/60 p-4 transition-colors duration-150 hover:border-accent/40 hover:bg-surface/70 ${
        alignEnd ? "sm:text-right" : ""
      }`}
    >
      <span className="block text-xs text-faint">{prefix}</span>
      <span className="mt-1 block text-sm font-medium text-text transition-colors duration-150 group-hover:text-accent">
        {post.title}
      </span>
    </Link>
  );
}