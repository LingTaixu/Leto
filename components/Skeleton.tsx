/**
 * 列表加载骨架屏（design-system §3.8）
 * 标题条 / 摘要条 / 图片块灰块 + animate-pulse，带 aria-busy
 */
export function ArticleCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="加载中"
      className="overflow-hidden rounded-lg border border-border/60 bg-surface/70 p-6"
    >
      <div className="mb-3 flex gap-2">
        <span className="h-6 w-14 animate-pulse rounded-full bg-border/70" />
        <span className="h-6 w-16 animate-pulse rounded-full bg-border/70" />
      </div>
      <span className="block h-6 w-3/4 animate-pulse rounded-md bg-border/70" />
      <span className="mt-3 block h-4 w-full animate-pulse rounded-md bg-border/50" />
      <span className="mt-2 block h-4 w-5/6 animate-pulse rounded-md bg-border/50" />
      <span className="mt-5 block h-3 w-40 animate-pulse rounded-md bg-border/50" />
    </div>
  );
}

/**
 * 列表空状态（design-system §3.8）
 */
export function EmptyState({
  title = "暂无内容",
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-16 text-center">
      <p className="text-base font-medium text-text">{title}</p>
      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}