import Link from "next/link";

/**
 * 标签（design-system §3.4）
 * font-mono 小字号胶囊，hover 时 border/文字变 accent
 */
export function Tag({ name, href }: { name: string; href?: string }) {
  const className =
    "inline-flex items-center rounded-full border border-border px-2.5 py-1 font-mono text-xs text-muted transition-colors duration-150 hover:border-accent hover:text-accent";

  if (href) {
    return (
      <Link href={href} className={className}>
        #{name}
      </Link>
    );
  }
  return <span className={className}>#{name}</span>;
}