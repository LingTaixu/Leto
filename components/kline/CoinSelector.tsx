"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HttpTransport, InfoClient } from "@nktkas/hyperliquid";

const UP = "#26a69a";
const DOWN = "#ef5350";

interface CoinSelectorData {
  coins: string[];
  quote?: Record<
    string,
    { change24h: number | null; dayNtlVlm: number | null }
  >;
}

let cached: CoinSelectorData | null = null;

async function loadData(): Promise<CoinSelectorData> {
  if (cached) return cached;
  const client = new InfoClient({ transport: new HttpTransport() });
  const [meta, ctxs] = await Promise.all([
    client.meta(),
    client.metaAndAssetCtxs(),
  ]);
  const coins = meta.universe
    .map((u) => u.name)
    .filter((n) => !n.startsWith("@") && !n.startsWith("#"))
    .sort();
  const quote: CoinSelectorData["quote"] = {};
  meta.universe.forEach((u, i) => {
    const ctx = ctxs[1]?.[i];
    if (!ctx) return;
    const mark = Number(ctx.markPx);
    const prev = Number(ctx.prevDayPx);
    quote[u.name] = {
      change24h: prev > 0 ? ((mark - prev) / prev) * 100 : null,
      dayNtlVlm: Number(ctx.dayNtlVlm),
    };
  });
  cached = { coins, quote };
  return cached;
}

export function CoinSelector({
  value,
  coinList,
  onSelect,
}: {
  value: string;
  coinList: string[];
  onSelect: (coin: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<CoinSelectorData | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 首载加载一次（缓存）
  useEffect(() => {
    let cancelled = false;
    loadData()
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // 打开时聚焦搜索框
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => {
      setQuery("");
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(raf);
  }, [open]);

  // 点击外部 / Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const coins = useMemo(
    () =>
      data?.coins && data.coins.length > 0 ? data.coins : coinList,
    [data, coinList],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return coins;
    return coins.filter((c) => c.toUpperCase().includes(q));
  }, [coins, query]);

  const pick = (coin: string) => {
    onSelect(coin);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex cursor-pointer items-center gap-2 border-[3px] border-border bg-surface px-3 py-1.5 font-mono text-sm font-bold text-text transition-all duration-100 hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-on-accent hover:shadow-neu-sm active:translate-x-px active:translate-y-px active:shadow-none"
      >
        {value}
        <span aria-hidden="true" className="text-xs">
          {open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-[280px] border-[3px] border-border bg-surface shadow-neu">
          {/* 搜索框 */}
          <div className="border-b-[3px] border-border p-2">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contract"
              className="w-full rounded-none border-[3px] border-border bg-bg px-2 py-1 font-mono text-sm text-text focus:outline-2 focus:outline-accent"
            />
          </div>

          {/* 列表头 */}
          <div className="flex items-center justify-between border-b border-border bg-surface-2 px-2 py-1 font-mono text-[10px] font-bold text-faint">
            <span>CONTRACT</span>
            <span>24H</span>
            <span>VOLUME</span>
          </div>

          {/* 列表 */}
          <ul className="max-h-[320px] overflow-y-auto py-1 font-mono text-xs">
            {filtered.map((name) => {
              const q = data?.quote?.[name];
              const active = name === value;
              const chg = q?.change24h;
              const color =
                chg === null || chg === undefined
                  ? undefined
                  : chg >= 0
                    ? UP
                    : DOWN;
              return (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => pick(name)}
                    className={`flex w-full items-center justify-between px-2 py-1 text-left transition-colors duration-75 hover:bg-accent hover:text-on-accent ${
                      active ? "bg-surface-2 font-bold" : ""
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span style={{ color }} className="w-12 text-right">
                      {chg === null || chg === undefined
                        ? "—"
                        : `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`}
                    </span>
                    <span className="w-16 text-right text-faint">
                      {q?.dayNtlVlm !== undefined && q?.dayNtlVlm !== null
                        ? q.dayNtlVlm >= 1_000_000
                          ? (q.dayNtlVlm / 1_000_000).toFixed(1) + "M"
                          : q.dayNtlVlm >= 1_000
                            ? (q.dayNtlVlm / 1_000).toFixed(1) + "K"
                            : q.dayNtlVlm.toFixed(0)
                        : "—"}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-2 py-2 text-faint">No match</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}