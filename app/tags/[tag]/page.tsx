import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArticleList } from "@/components/ArticleCard";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type TagPageProps = {
  params: Promise<{ tag: string }>;
};

export function generateStaticParams() {
  return getAllTags().map((tag) => ({ tag }));
}

export function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  return params.then(({ tag }) => ({
    title: `#${tag} · Leto's Blog`,
  }));
}

export default async function TagPage({ params }: TagPageProps) {
  const { tag } = await params;
  const articles = getPostsByTag(tag);
  if (articles.length === 0) notFound();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 pb-28 lg:pb-10">
      <nav aria-label="面包屑" className="mb-8 text-sm text-faint">
        <Link
          href="/tags"
          className="transition-colors duration-150 hover:text-accent"
        >
          Tags
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span aria-current="page" className="text-text">
          {tag}
        </span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-text">
        标签：{tag}
      </h1>
      <p className="mt-2 text-sm text-faint">{articles.length} 篇文章</p>

      <div className="mt-8">
        <ArticleList articles={articles} />
      </div>
    </main>
  );
}