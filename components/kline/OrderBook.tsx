"use client";

import type { OrderBookData } from "./useKlineTrade";

const MAX_DEPTH = 18;
const UP_BID = "#26a69a";
const DOWN_ASK = "#ef5350";

function BarRow({
  price,
  size,
  total,
  maxTotal,
  color,
}: {
  price: number;
  size: number;
  total: number;
  maxTotal: number;
  color: string;
}) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  return (
    <div className="relative flex items-center justify-between px-2 py-[1px] font-mono text-xs leading-5">
      <span className="z-10" style={{ color }}>
        {price.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </span>
      <span className="z-10 text-text/80">{size.toFixed(4)}</span>
      <span className="z-10 text-text/60">{total.toFixed(4)}</span>
      <div
        className="pointer-events-none absolute right-0 top-0 h-full opacity-20"
        style={{
          width: `${pct}%`,
          background: color,
        }}
      />
    </div>
  );
}

export function OrderBook({ data }: { data: OrderBookData | null }) {
  if (!data) return <div className="h-full p-2 text-xs text-faint">Loading order book…</div>;

  const maxBid = data.bids.length > 0 ? data.bids[0]!.total : 0;
  const maxAsk = data.asks.length > 0 ? data.asks[0]!.total : 0;

  return (
    <div className="flex max-h-[420px] flex-col overflow-y-auto text-xs">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface px-2 py-1 font-bold text-faint">
        <span>Price</span>
        <span>Size</span>
        <span>Total</span>
      </div>
      {/* 卖方（asks/红色，从高到低→底价近） */}
      <div className="border-b border-border/30">
        {data.asks
          .slice(-MAX_DEPTH)
          .reverse()
          .map((r, i) => (
            <BarRow key={`a${i}-${r.price}`} {...r} maxTotal={maxAsk} color={DOWN_ASK} />
          ))}
      </div>
      {/* 中间价分隔 */}
      <div className="border-y border-border bg-surface/50 px-2 py-0.5 text-center text-xs font-bold text-text/90">
        {data.asks.length > 0 && data.bids.length > 0
          ? ((data.asks[0]!.price + data.bids[0]!.price) / 2).toFixed(4)
          : "—"}
      </div>
      {/* 买方（bids/绿色，从高到低） */}
      <div>
        {data.bids.slice(0, MAX_DEPTH).map((r, i) => (
          <BarRow key={`b${i}-${r.price}`} {...r} maxTotal={maxBid} color={UP_BID} />
        ))}
      </div>
    </div>
  );
}