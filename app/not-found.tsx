import Link from "next/link";

/**
 * 404（design-system §3.8）
 * 大号数字 + 说明 + 返回首页
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[62.5rem] flex-1 flex-col items-center justify-center px-6 py-24 pb-28 text-center lg:pb-10">
      <p
        aria-hidden="true"
        className="font-mono text-5xl font-bold tracking-tight text-faint"
      >
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text">Page not found / 页面未找到</h1>
      <p className="mt-2 text-base text-muted">
        The link may have moved or been removed. / 你访问的链接可能已移动或被删除。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center border-[3px] border-border bg-text px-6 text-sm font-bold text-bg shadow-neu transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu-lg active:translate-x-0.5 active:translate-y-0.5 active:shadow-none focus-visible:outline-3 focus-visible:outline-[var(--border)] focus-visible:outline-offset-3"
      >
        Back to home / 返回首页
      </Link>
    </main>
  );
}