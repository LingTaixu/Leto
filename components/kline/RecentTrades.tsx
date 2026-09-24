"use client";

import type { TradeRow } from "./useKlineTrade";

function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

export function RecentTrades({ trades }: { trades: TradeRow[] }) {
  if (trades.length === 0)
    return <div className="p-2 text-xs text-faint">Loading trades…</div>;

  // 涨跌色：最新一条与前一条对比
  const upColor = "#26a69a";
  const downColor = "#ef5350";

  return (
    <div className="flex max-h-[260px] flex-col overflow-y-auto text-xs">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-2 py-1 font-bold text-faint">
        <span>Price</span>
        <span>Size</span>
        <span>Time</span>
      </div>
      {trades.map((t, i) => {
        const prev = trades[i + 1];
        const up = prev ? t.price >= prev.price : true;
        return (
          <div
            key={t.id}
            className="flex items-center justify-between px-2 py-[1px] font-mono text-xs leading-5"
          >
            <span style={{ color: up ? upColor : downColor }}>
              {t.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
            </span>
            <span className="text-text/80">{t.size.toFixed(4)}</span>
            <span className="text-text/40">{formatTime(t.time)}</span>
          </div>
        );
      })}
    </div>
  );
}