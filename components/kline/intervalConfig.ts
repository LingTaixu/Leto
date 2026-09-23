/** Hyperliquid candle 全部 14 档 interval（见 WS subscriptions 文档） */
export type KlineInterval =
  | "1m" | "3m" | "5m" | "15m" | "30m"
  | "1h" | "2h" | "4h" | "8h" | "12h"
  | "1d" | "3d" | "1w" | "1M";

/** 切换器展示的常用档位 */
export const UI_INTERVALS = ["1m", "5m", "15m", "1h", "4h", "1d"] as const;

export type UiInterval = (typeof UI_INTERVALS)[number];

export const DEFAULT_COIN = "ETH";
export const DEFAULT_INTERVAL: UiInterval = "1h";

export function isUiInterval(value: string): value is UiInterval {
  return (UI_INTERVALS as readonly string[]).includes(value);
}

/** 各周期的秒数（历史分页窗口计算用） */
export const INTERVAL_SECONDS: Record<KlineInterval, number> = {
  "1m": 60,
  "3m": 180,
  "5m": 300,
  "15m": 900,
  "30m": 1800,
  "1h": 3600,
  "2h": 7200,
  "4h": 14400,
  "8h": 28800,
  "12h": 43200,
  "1d": 86400,
  "3d": 259200,
  "1w": 604800,
  "1M": 2592000,
};

/** 单批向前加载的根数 */
export const LOAD_BATCH = 250;
/** 触发加载的回看阈值（可见范围 from 低于此值时请求更早数据） */
export const LOAD_THRESHOLD = 15;