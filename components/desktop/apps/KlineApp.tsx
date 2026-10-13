"use client";

import { Suspense } from "react";
import { KlineView } from "@/components/kline/KlineView";

/**
 * K 线窗口：复用 KlineView（URL 状态 coin/interval 与深链 app 参数共存）
 */
export function KlineApp() {
  return (
    <Suspense
      fallback={
        <p className="py-6 text-center font-mono text-sm text-faint">
          Loading
        </p>
      }
    >
      <KlineView />
    </Suspense>
  );
}
