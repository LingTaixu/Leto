import Link from "next/link";

/**
 * 标签（neubrutalism）
 * 3px 硬边框 + 白底 + 小圆角，悬停变黄色 accent
 *
 * @param name  标签名（自动带 # 前缀）
 * @param href  可选链接，传了渲 《Link》 否则 <span>
 * @param className 额外类名合并
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
    "inline-flex items-center border-[3px] border-border bg-surface px-2.5 py-1 rounded-sm font-mono text-xs font-bold text-text transition-all duration-100 hover:bg-accent hover:text-on-accent hover:shadow-neu-sm";
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