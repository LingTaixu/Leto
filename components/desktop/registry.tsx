"use client";

import {
  lazy,
  type ComponentType,
  type LazyExoticComponent,
  type SVGProps,
} from "react";
import type { MessageKey } from "@/lib/i18n";

export type AppId = "home" | "blog" | "about" | "kline" | "notary" | "transfer";

/** 窗口内容组件统一 props：深链参数（如 blog 的 slug） */
export interface AppContentProps {
  /** 深链/窗口内导航参数（如 { slug }） */
  params: Record<string, string>;
  /** 窗口内导航时更新参数（同步到 URL 深链） */
  setParams: (next: Record<string, string>) => void;
}

export interface AppDef {
  id: AppId;
  /** 应用名消息键（桌面图标 / 任务栏 / 标题栏共用） */
  nameKey: MessageKey;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** 默认窗口尺寸 */
  defaultSize: { w: number; h: number };
  /** 最小窗口尺寸 */
  minSize: { w: number; h: number };
  Content: LazyExoticComponent<ComponentType<AppContentProps>>;
}

const HomeApp = lazy(() =>
  import("./apps/HomeApp").then((m) => ({ default: m.HomeApp })),
);
const BlogApp = lazy(() =>
  import("./apps/BlogApp").then((m) => ({ default: m.BlogApp })),
);
const AboutApp = lazy(() =>
  import("./apps/AboutApp").then((m) => ({ default: m.AboutApp })),
);
const KlineApp = lazy(() =>
  import("./apps/KlineApp").then((m) => ({ default: m.KlineApp })),
);
const NotaryApp = lazy(() =>
  import("./apps/NotaryApp").then((m) => ({ default: m.NotaryApp })),
);
const TransferApp = lazy(() =>
  import("./apps/TransferApp").then((m) => ({ default: m.TransferApp })),
);

export const APPS: Record<AppId, AppDef> = {
  home: {
    id: "home",
    nameKey: "nav.home",
    Icon: HomeIcon,
    defaultSize: { w: 720, h: 560 },
    minSize: { w: 340, h: 320 },
    Content: HomeApp,
  },
  blog: {
    id: "blog",
    nameKey: "nav.blog",
    Icon: BlogIcon,
    defaultSize: { w: 920, h: 640 },
    minSize: { w: 360, h: 360 },
    Content: BlogApp,
  },
  about: {
    id: "about",
    nameKey: "nav.about",
    Icon: UserIcon,
    defaultSize: { w: 860, h: 620 },
    minSize: { w: 340, h: 360 },
    Content: AboutApp,
  },
  kline: {
    id: "kline",
    nameKey: "desktop.apps.kline",
    Icon: KlineIcon,
    defaultSize: { w: 1120, h: 720 },
    minSize: { w: 380, h: 420 },
    Content: KlineApp,
  },
  notary: {
    id: "notary",
    nameKey: "desktop.apps.notary",
    Icon: NotaryIcon,
    defaultSize: { w: 960, h: 660 },
    minSize: { w: 360, h: 400 },
    Content: NotaryApp,
  },
  transfer: {
    id: "transfer",
    nameKey: "desktop.apps.transfer",
    Icon: TransferIcon,
    defaultSize: { w: 900, h: 620 },
    minSize: { w: 360, h: 400 },
    Content: TransferApp,
  },
};

/** 桌面图标排列顺序 */
export const APP_ORDER: AppId[] = [
  "home",
  "blog",
  "about",
  "kline",
  "notary",
  "transfer",
];

export function isAppId(value: string | null | undefined): value is AppId {
  return !!value && value in APPS;
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

function BlogIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M5 3h14v18H5z" />
      <path d="M8.5 7.5h7M8.5 11h7M8.5 14.5h4" />
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

function KlineIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M3 21h18" />
      <path d="M7 6v2M7 17v1" />
      <rect x="5" y="8" width="4" height="9" />
      <path d="M15 4v1M15 16v2" />
      <rect x="13" y="5" width="4" height="11" />
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

function TransferIcon(props: SVGProps<SVGSVGElement>) {
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
      <path d="M4 8h13l-3-3M20 16H7l3 3" />
    </svg>
  );
}
