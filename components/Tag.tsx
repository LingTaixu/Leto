import Link from "next/link";

/**
 * 标签（design-system §3.4）
 * font-mono 小字号胶囊，hover 时 border/文字变 accent
 *
 * @param name  标签名（自动带 # 前缀）
 * @param href  可选链接，传了渲 《Link》 否则 <span>
 * @param className 额外类名合并（如配合流光卡片的 z-index）
 */
export function Tag({
  name,
  href,
  className = "",
}: {
  name: string;
  href?: string;
  className?: string;
}) {
  const base =
    "inline-flex items-center rounded-full border border-border/80 bg-surface/80 px-2.5 py-1 font-mono text-xs text-muted backdrop-blur transition-colors duration-150 hover:border-accent hover:text-accent";
  const cls = `${base} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={cls}>
        #{name}
      </Link>
    );
  }
  return <span className={cls}>#{name}</span>;
}