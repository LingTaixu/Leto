import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";

const base =
  "inline-flex h-10 items-center justify-center gap-2 border-[3px] border-border px-4 text-sm font-heading font-bold transition-all duration-100 focus-visible:outline-3 focus-visible:outline-[var(--border)] focus-visible:outline-offset-3 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // neubrutalism 主按钮：黑底白字 + 硬阴影，悬停上浮放大阴影，点击下压消影
  // 悬停硬阴影为规范级 5px 5px 0 0（spec: 按钮边框场景）
  primary:
    "bg-text text-bg shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  // 黄色实心按钮：neubrutalism 点缀色
  secondary:
    "bg-accent text-on-accent shadow-neu-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  // 描边按钮：无阴影，悬停补硬阴影
  ghost:
    "border-border bg-transparent text-text hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-neu active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
  // 文本链接：下划线
  link: "border-0 text-text underline underline-offset-4 decoration-2 hover:text-on-accent hover:bg-accent",
};

type CommonProps = {
  variant?: Variant;
  className?: string;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  (
    | ({ href: string } & AnchorHTMLAttributes<HTMLAnchorElement>)
    | { href?: undefined }
  );

/**
 * 按钮（neubrutalism）
 * 硬边框 + 硬阴影 + 零圆角：primary 黑底白字，secondary 黄底黑字，
 * ghost 描边，link 下划线。悬停上浮放大阴影，按下下压消影。
 */
export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest;
    return (
      <Link href={href} className={cls} {...anchorRest}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}