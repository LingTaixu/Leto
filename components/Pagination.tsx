"use client";

import { useI18n } from "@/lib/i18n";

type PaginationProps = {
  /** 当前页码（1 起） */
  page: number;
  /** 总页数 */
  totalPages: number;
  /** 页码回调（桌面窗口内状态切换，不再走路由） */
  onPage: (page: number) => void;
};

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
 * 分页（neubrutalism，桌面窗口版）
 * 硬边框方块按钮，当前页反色高亮，多页时省略号压缩
 */
export function Pagination({ page, totalPages, onPage }: PaginationProps) {
  const { t } = useI18n();
  if (totalPages <= 1) return null;

  const itemCls =
    "inline-flex h-9 min-w-9 cursor-pointer items-center justify-center border-[3px] border-border bg-surface px-2 text-sm font-bold transition-all duration-100 focus-visible:outline-3 focus-visible:outline-[var(--border)] focus-visible:outline-offset-2 hover:-translate-x-px hover:-translate-y-px hover:shadow-neu-sm active:translate-x-px active:translate-y-px active:shadow-none";

  return (
    <nav
      aria-label={t("pagination.label")}
      className="mt-6 flex items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          aria-label={t("pagination.prev")}
          className={`${itemCls} text-text hover:bg-accent hover:text-on-accent`}
        >
          ←
        </button>
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
            className={`${itemCls} cursor-default bg-text text-bg shadow-neu-sm`}
          >
            {item}
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPage(item)}
            className={`${itemCls} text-text hover:bg-accent hover:text-on-accent`}
          >
            {item}
          </button>
        ),
      )}

      {page < totalPages ? (
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          aria-label={t("pagination.next")}
          className={`${itemCls} text-text hover:bg-accent hover:text-on-accent`}
        >
          →
        </button>
      ) : null}
    </nav>
  );
}
