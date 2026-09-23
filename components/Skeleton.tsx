"use client";

import { useI18n } from "@/lib/i18n";

/**
 * 列表加载骨架屏（neubrutalism）
 * 硬边框 + 实心灰块 + animate-pulse，带 aria-busy
 */
export function ArticleCardSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="加载中"
      className="border-[3px] border-border bg-surface p-6 shadow-neu-sm"
    >
      <div className="mb-3 flex gap-2">
        <span className="h-6 w-14 animate-pulse border border-border bg-surface-2" />
        <span className="h-6 w-16 animate-pulse border border-border bg-surface-2" />
      </div>
      <span className="block h-6 w-3/4 animate-pulse border border-border bg-surface-2" />
      <span className="mt-3 block h-4 w-full animate-pulse border border-border bg-surface-2" />
      <span className="mt-2 block h-4 w-5/6 animate-pulse border border-border bg-surface-2" />
      <span className="mt-5 block h-3 w-40 animate-pulse border border-border bg-surface-2" />
    </div>
  );
}

/**
 * 列表空状态（neubrutalism）
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}) {
  const { t } = useI18n();
  const resolvedTitle = title ?? t("common.empty");
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border px-6 py-16 text-center">
      <p className="text-base font-bold text-text">{resolvedTitle}</p>
      {description && (
        <p className="mt-2 text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}