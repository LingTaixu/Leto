import Link from "next/link";

/**
 * 404（design-system §3.8）
 * 大号数字 + 说明 + 返回首页
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-24 pb-28 text-center lg:pb-10">
      <p
        aria-hidden="true"
        className="font-mono text-5xl font-bold tracking-tight text-faint"
      >
        404
      </p>
      <h1 className="mt-4 text-xl font-semibold text-text">页面不存在</h1>
      <p className="mt-2 text-base text-muted">
        你访问的链接可能已移动或被删除。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-text px-6 text-sm font-medium text-bg transition-opacity duration-150 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        返回首页
      </Link>
    </main>
  );
}