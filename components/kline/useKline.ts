"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
  type ISubscription,
} from "@nktkas/hyperliquid";
import {
  formatSingleCandle,
  formatWsCandle,
  type candlestickData,
} from "./formatKline";
import {
  INTERVAL_SECONDS,
  LOAD_BATCH,
  LOAD_THRESHOLD,
  type KlineInterval,
} from "./intervalConfig";

interface SnapshotData {
  coin: string;
  interval: string;
  epoch: number;
  candles: candlestickData[];
}

export interface UseKlineResult {
  candles: candlestickData[];
  coinList: string[];
  loading: boolean;
  error: string | null;
  olderLoading: boolean;
  exhausted: boolean;
  epoch: number;
  /** 滚到历史边缘时请求更早一批 */
  loadOlder: (from: number, total: number) => void;
}

/** 单条 WSS 长连接复用（模块级懒初始化，仅 effect 内调用 → 客户端执行） */
let sharedSubs: SubscriptionClient | null = null;
function getSubscriptionClient(): SubscriptionClient {
  if (!sharedSubs) {
    sharedSubs = new SubscriptionClient({
      transport: new WebSocketTransport(),
    });
  }
  return sharedSubs;
}

let epochCounter = 0;
const nextEpoch = () => ++epochCounter;

/**
 * 快照 + 历史分页懒加载 + WSS 实时。
 * - loading 派生自"已加载数据参数是否匹配当前参数"（避免 effect 内同步 setState）
 * - 切换保留上一组 candles，防闪
 * - 实时数据经 onCandle imperative 转发（不触发 React 渲染）
 * - loadOlder 前插更早一批，保持视图（配合 TradingView 索引补偿）
 */
export function useKline(
  coin: string,
  interval: KlineInterval,
  onCandle?: (candle: candlestickData) => void,
): UseKlineResult {
  const [data, setData] = useState<SnapshotData | null>(null);
  const [coinList, setCoinList] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [olderLoading, setOlderLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);

  // 回调走 ref（避免引用变化导致重订阅 / stale 闭包）
  const onCandleRef = useRef(onCandle);
  useEffect(() => {
    onCandleRef.current = onCandle;
  });

  // 最新快照（loadOlder 读取，避免 stale）
  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  });

  // 分页并发锁 + 边界（仅回调上下文读写，避开 render 期 ref 限制）
  const pagerRef = useRef({ loading: false, exhausted: false });

  // 快照：coin/interval 变化重新拉取（近 30 天）
  useEffect(() => {
    let cancelled = false;
    pagerRef.current = { loading: false, exhausted: false };
    const client = new InfoClient({ transport: new HttpTransport() });
    const endTime = Date.now();
    const startTime = endTime - 1000 * 60 * 60 * 24 * 30;

    client
      .candleSnapshot({ coin, interval, startTime, endTime })
      .then((snapshot) => {
        if (cancelled) return;
        setExhausted(false);
        setData({
          coin,
          interval,
          epoch: nextEpoch(),
          candles: formatSingleCandle(snapshot),
        });
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, [coin, interval]);

  // 币种列表：allMids 一次（失败不阻塞主流程）
  useEffect(() => {
    let cancelled = false;
    const client = new InfoClient({ transport: new HttpTransport() });

    client
      .allMids()
      .then((res) => {
        if (cancelled) return;
        const list = Object.keys(res.mids)
          .filter((k) => !k.startsWith("@"))
          .sort();
        setCoinList(list);
      })
      .catch(() => {
        /* 列表拉取失败不阻塞 */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // WSS 实时 candle 订阅（s/i 校验、切换退订、imperative 转发）
  useEffect(() => {
    let cancelled = false;
    let sub: ISubscription | null = null;
    const subs = getSubscriptionClient();

    subs
      .candle({ coin, interval }, (event) => {
        if (cancelled) return;
        if (event.s !== coin || event.i !== interval) return;
        onCandleRef.current?.(formatWsCandle(event));
      })
      .then((subscription) => {
        if (cancelled) {
          subscription.unsubscribe().catch(() => {});
        } else {
          sub = subscription;
        }
      })
      .catch((e) => {
        console.warn("[kline] ws subscribe failed:", e);
      });

    return () => {
      cancelled = true;
      sub?.unsubscribe().catch(() => {});
    };
  }, [coin, interval]);

  // 历史分页：滚到头部时前插更早一批
  const loadOlder = useCallback(
    (from: number, total: number) => {
      if (from > LOAD_THRESHOLD) return;
      if (pagerRef.current.loading || pagerRef.current.exhausted) return;

      const cur = dataRef.current;
      if (!cur || cur.coin !== coin || cur.interval !== interval) return;
      if (total === 0 || cur.candles.length === 0) return;

      const oldest = cur.candles[0]!;
      const intervalMs = INTERVAL_SECONDS[interval] * 1000;
      const endTime = Number(oldest.time) * 1000 - 1000; // 严格早于最早根
      const startTime = endTime - LOAD_BATCH * intervalMs;

      pagerRef.current.loading = true;
      setOlderLoading(true);

      const client = new InfoClient({ transport: new HttpTransport() });
      client
        .candleSnapshot({ coin, interval, startTime, endTime })
        .then((batch) => {
          const list = formatSingleCandle(batch);
          if (list.length === 0) {
            pagerRef.current.exhausted = true;
            setExhausted(true);
            return;
          }
          setData((prev) => {
            if (!prev || prev.coin !== coin || prev.interval !== interval) {
              return prev;
            }
            // 窗口边界可能包含与现有首根同时刻/更晚的根：合并必须去重并
            // 保持严格时间升序（setData 断言 data asc ordered by time）。
            // 同一时间戳保留 list（更早批）版本即可（数据同源）。
            const seen = new Set<number>();
            const candles = [...list, ...prev.candles]
              .sort((a, b) => Number(a.time) - Number(b.time))
              .filter((c) => {
                const t = Number(c.time);
                if (seen.has(t)) return false;
                seen.add(t);
                return true;
              });
            return { ...prev, candles };
          });
        })
        .catch((e) => {
          console.warn("[kline] load older failed:", e);
        })
        .finally(() => {
          pagerRef.current.loading = false;
          setOlderLoading(false);
        });
    },
    [coin, interval],
  );

  const matched = !!data && data.coin === coin && data.interval === interval;

  return {
    candles: matched ? data.candles : data?.candles ?? [],
    coinList,
    loading: !matched,
    error,
    olderLoading,
    exhausted,
    epoch: matched ? data.epoch : 0,
    loadOlder,
  };
}