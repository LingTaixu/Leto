import { ArticleCardSkeleton } from "@/components/Skeleton";

/**
 * 全局加载骨架（design-system §3.8）
 * App Router loading.tsx 约定：Segment 加载中自动替换页面
 */
export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="加载中"
      className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10"
    >
      <div className="mb-10">
        <span className="block h-9 w-56 animate-pulse border border-border bg-surface-2" />
        <span className="mt-3 block h-4 w-72 animate-pulse border border-border bg-surface-2" />
      </div>
      <div className="space-y-6">
        <ArticleCardSkeleton />
        <ArticleCardSkeleton />
      </div>
    </main>
  );
}