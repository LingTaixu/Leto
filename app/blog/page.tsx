import { ArticleList } from "@/components/ArticleCard";
import { getPosts } from "@/lib/posts";

export default function BlogPage() {
  const articles = getPosts();

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <h1 className="text-3xl font-bold tracking-tight text-text">文章</h1>
      <p className="mt-2 text-base text-muted">全部文章</p>
      <div className="mt-8">
        <ArticleList articles={articles} />
      </div>
    </main>
  );
}