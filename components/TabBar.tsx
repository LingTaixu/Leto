"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SVGProps } from "react";

const TABS = [
  { href: "/", label: "首页", Icon: HomeIcon },
  { href: "/notary", label: "存证", Icon: NotaryIcon },
  { href: "/about", label: "关于", Icon: UserIcon },
] as const;

type Tab = (typeof TABS)[number];

function isActive(tab: Tab, pathname: string): boolean {
  if (tab.href === "/") return pathname === "/";
  return pathname.startsWith(tab.href);
}

/**
 * Liquid Glass 胶囊导航（design-system §3.1.1）
 * 玻璃三层合成 + 液体滑动指示条 + aria-current 激活态
 */
export function TabBar() {
  const pathname = usePathname();
  const activeIndex = TABS.findIndex((tab) => isActive(tab, pathname));
  const safeIndex = activeIndex === -1 ? 0 : activeIndex;

  return (
    <nav
      aria-label="主导航"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[calc(0.75rem+env(safe-area-inset-bottom))] px-4 lg:hidden"
    >
      <div className="liquid-glass relative flex h-16 w-full max-w-sm items-center rounded-full px-2">
        {/* 液体滑动指示条：translateX 在 Tab 间滑动 */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-2 left-2 rounded-full bg-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:bg-white/15 dark:shadow-none"
          style={{
            width: "calc((100% - 1rem) / 3)",
            transform: `translateX(${safeIndex * 100}%)`,
          }}
        />

        {TABS.map((tab, i) => {
          const { Icon } = tab;
          const active = i === safeIndex;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className="relative z-10 flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-faint transition-colors duration-200 hover:text-muted aria-[current=page]:text-accent aria-[current=page]:font-semibold"
            >
              <Icon className="size-5" aria-hidden="true" />
              <span className="text-[11px] leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ---------- 图标（inline SVG，零依赖） ---------- */

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </svg>
  );
}

function NotaryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3 4.5 7v10L12 21l7.5-4V7L12 3Z" />
      <path d="M12 12 4.5 8M12 12l7.5-4M12 12v9" />
    </svg>
  );
}

function UserIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20c1.2-3 4.2-4.5 7.5-4.5s6.3 1.5 7.5 4.5" />
    </svg>
  );
}
