"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

type PaginationProps = {
  basePath: string;
  /** 当前页码（1 起） */
  page: number;
  /** 总页数 */
  totalPages: number;
};

function pageUrl(basePath: string, page: number) {
  // 首页省略 /1，其余带页码
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

function pageItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const items: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) items.push("…");
  for (let i = start; i <= end; i++) items.push(i);
  if (end < total - 1) items.push("…");
  items.push(total);
  return items;
}

/**
 * 分页（design-system §3.6）
 * 纯链接（No JS）。当前页反色高亮，移动端压缩为省略号
 */
export function Pagination({ basePath, page, totalPages }: PaginationProps) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const itemCls =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

  return (
    <nav
      aria-label={t("pagination.label")}
      className="mt-12 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link
          href={pageUrl(basePath, page - 1)}
          aria-label={t("pagination.prev")}
          className={`${itemCls} text-muted hover:text-accent`}
        >
          ←
        </Link>
      ) : null}

      {pageItems(page, totalPages).map((item, i) =>
        item === "…" ? (
          <span
            key={`dots-${i}`}
            aria-hidden="true"
            className="min-w-6 text-center text-sm text-faint"
          >
            …
          </span>
        ) : item === page ? (
          <span
            key={item}
            aria-current="page"
            className={`${itemCls} bg-text text-bg`}
          >
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={pageUrl(basePath, item)}
            className={`${itemCls} text-muted hover:text-accent`}
          >
            {item}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link
          href={pageUrl(basePath, page + 1)}
          aria-label={t("pagination.next")}
          className={`${itemCls} text-muted hover:text-accent`}
        >
          →
        </Link>
      ) : null}
    </nav>
  );
}