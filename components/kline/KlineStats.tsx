"use client";

import type { CoinStats } from "./useKlineTrade";

function fmt(n: number, digits = 4): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

function fmtLarge(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(2) + "K";
  return n.toFixed(2);
}

function fmtFunding(n: number): string {
  return (n * 100).toFixed(4) + "%";
}

export function KlineStats({ stats }: { stats: CoinStats | null }) {
  if (!stats)
    return (
      <div className="flex items-center gap-4 px-4 py-2 text-xs text-faint">
        Loading…
      </div>
    );

  const isUp = stats.change24h >= 0;
  const color = isUp ? "#26a69a" : "#ef5350";

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-2 text-xs">
      <span className="text-base font-bold" style={{ color }}>
        ${fmt(stats.markPx)}
      </span>
      <span style={{ color }}>
        {isUp ? "+" : ""}
        {stats.change24h.toFixed(2)}%
      </span>
      <span className="text-faint">
        24h Vol <span className="text-text/80">{fmt(stats.dayNtlVlm)}</span>
      </span>
      <span className="text-faint">
        OI <span className="text-text/80">{fmtLarge(stats.openInterest)}</span>
      </span>
      <span className="text-faint">
        Funding <span className="text-text/80">{fmtFunding(stats.funding)}</span>
      </span>
    </div>
  );
}