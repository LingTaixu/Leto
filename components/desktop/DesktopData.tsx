"use client";

import { createContext, useContext } from "react";
import type { Article } from "@/lib/posts";
import type { Locale } from "@/lib/locales";

/**
 * 桌面级 server 注入数据（文章列表 + 正文 HTML）
 * app/[locale]/page.tsx（server）→ <Desktop> → 各窗口内容组件
 */
export interface DesktopData {
  locale: Locale;
  articles: Article[];
}

const DesktopDataContext = createContext<DesktopData | null>(null);

export const DesktopDataProvider = DesktopDataContext.Provider;

export function useDesktopData(): DesktopData {
  const ctx = useContext(DesktopDataContext);
  if (!ctx) {
    throw new Error("useDesktopData must be used within DesktopDataProvider");
  }
  return ctx;
}
