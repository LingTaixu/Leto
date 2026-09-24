"use client";

import { useEffect, useRef, useState } from "react";
import {
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
  type ISubscription,
} from "@nktkas/hyperliquid";

export interface BookLevel {
  price: number;
  size: number;
  total: number;
}

export interface OrderBookData {
  bids: BookLevel[];
  asks: BookLevel[];
  updatedAt: number;
}

export interface TradeRow {
  id: number;
  price: number;
  size: number;
  side: "B" | "A";
  time: number;
}

export interface CoinStats {
  markPx: number;
  prevDayPx: number;
  dayNtlVlm: number;
  dayBaseVlm: number;
  funding: number;
  openInterest: number;
  change24h: number;
}

export interface KlineTradeResult {
  orderBook: OrderBookData | null;
  trades: TradeRow[];
  stats: CoinStats | null;
  loading: boolean;
}

let _infoClient: InfoClient | null = null;
function getInfoClient(): InfoClient {
  if (!_infoClient) _infoClient = new InfoClient({ transport: new HttpTransport() });
  return _infoClient;
}

let _wsClient: SubscriptionClient | null = null;
function getWsClient(): SubscriptionClient {
  if (!_wsClient) _wsClient = new SubscriptionClient({ transport: new WebSocketTransport() });
  return _wsClient;
}

interface LevelEntry {
  px: string;
  sz: string;
  n: number;
}

function aggregateLevels(items: LevelEntry[]): BookLevel[] {
  let total = 0;
  return items.map((l) => {
    total += Number(l.sz);
    return { price: Number(l.px), size: Number(l.sz), total };
  });
}

export function useKlineTrade(coin: string): KlineTradeResult {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [trades, setTrades] = useState<TradeRow[]>([]);
  const [stats, setStats] = useState<CoinStats | null>(null);
  const [loading, setLoading] = useState(true);
  const cancelledRef = useRef(false);

  // ——— 24h Stats ———
  useEffect(() => {
    cancelledRef.current = false;
    const c = { current: false };

    getInfoClient()
      .metaAndAssetCtxs()
      .then(([meta, assetCtxs]) => {
        if (c.current) return;
        const idx = meta.universe.findIndex((u) => u.name === coin);
        if (idx < 0) return;
        const ctx = assetCtxs[idx];
        const markPx = Number(ctx.markPx);
        const prevDayPx = Number(ctx.prevDayPx);
        setStats({
          markPx,
          prevDayPx,
          dayNtlVlm: Number(ctx.dayNtlVlm),
          dayBaseVlm: Number(ctx.dayBaseVlm),
          funding: Number(ctx.funding),
          openInterest: Number(ctx.openInterest),
          change24h: prevDayPx > 0 ? ((markPx - prevDayPx) / prevDayPx) * 100 : 0,
        });
        setLoading(false);
      })
      .catch(() => {
        if (!c.current) setLoading(false);
      });

    return () => {
      c.current = true;
    };
  }, [coin]);

  // ——— Order Book ———
  useEffect(() => {
    const c = { current: false };
    let sub: ISubscription | null = null;

    getInfoClient()
      .l2Book({ coin, nSigFigs: 2 })
      .then((snapshot) => {
        if (c.current || !snapshot) return;
        setOrderBook({
          bids: aggregateLevels(snapshot.levels[0]),
          asks: aggregateLevels(snapshot.levels[1]),
          updatedAt: Date.now(),
        });
        setLoading(false);
      })
      .catch(() => {
        if (!c.current) setLoading(false);
      });

    getWsClient()
      .l2Book({ coin, nSigFigs: 2 }, (event) => {
        if (c.current) return;
        setOrderBook({
          bids: aggregateLevels(event.levels[0]),
          asks: aggregateLevels(event.levels[1]),
          updatedAt: Date.now(),
        });
      })
      .then((s) => {
        sub = s;
      })
      .catch(() => {});

    return () => {
      c.current = true;
      sub?.unsubscribe().catch(() => {});
    };
  }, [coin]);

  // ——— Recent Trades ———
  useEffect(() => {
    const c = { current: false };
    let sub: ISubscription | null = null;

    getInfoClient()
      .recentTrades({ coin })
      .then((initial) => {
        if (c.current) return;
        setTrades(
          initial.map((t) => ({
            id: t.tid,
            price: Number(t.px),
            size: Number(t.sz),
            side: t.side,
            time: t.time,
          })),
        );
      })
      .catch(() => {});

    getWsClient()
      .trades({ coin }, (events) => {
        if (c.current) return;
        setTrades((prev) => {
          const next = events.map((t) => ({
            id: t.tid,
            price: Number(t.px),
            size: Number(t.sz),
            side: t.side,
            time: t.time,
          }));
          return [...next, ...prev].slice(0, 100);
        });
      })
      .then((s) => {
        sub = s;
      })
      .catch(() => {});

    return () => {
      c.current = true;
      sub?.unsubscribe().catch(() => {});
    };
  }, [coin]);

  return { orderBook, trades, stats, loading };
}