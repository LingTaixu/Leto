import Link from "next/link";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "link";

const base =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // 瑞士风反色按钮：黑底白字
  primary: "bg-text text-bg hover:opacity-90",
  secondary: "border border-border bg-surface text-text hover:border-accent/40",
  ghost: "text-muted hover:text-text",
  link: "text-accent underline underline-offset-2 hover:text-accent-hover",
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
 * 按钮（design-system §3.5）
 * Primary 用瑞士风反色（黑底白字），Secondary 描边，Ghost 文本，Link 下划线
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