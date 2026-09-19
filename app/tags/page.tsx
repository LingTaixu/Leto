import Link from "next/link";
import { getAllTags } from "@/lib/posts";

export default function TagsPage() {
  const tags = getAllTags();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10 pb-28 lg:pb-10">
      <h1 className="text-3xl font-bold tracking-tight text-text">标签</h1>
      <p className="mt-2 text-sm text-faint">共 {tags.length} 个标签</p>
      <div className="mt-6 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag}`}
            className="rounded-full border border-border px-3 py-1.5 font-mono text-sm text-muted transition-colors duration-150 hover:border-accent hover:text-accent"
          >
            #{tag}
          </Link>
        ))}
      </div>
    </main>
  );
}