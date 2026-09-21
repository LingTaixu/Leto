import Link from "next/link";

/**
 * 页脚（design-system §3.1）
 * 简洁两行：版权 + 社交链接
 */
export function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-2 px-6 py-8 text-sm text-faint md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Leto · Built with Next.js</p>
        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/LingTaixu"
            target="_blank"
            rel="noreferrer"
            className="transition-colors duration-150 hover:text-accent"
          >
            GitHub
          </Link>
          <Link
            href="/rss.xml"
            className="transition-colors duration-150 hover:text-accent"
          >
            RSS
          </Link>
        </div>
      </div>
    </footer>
  );
}