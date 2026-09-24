"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { TradingView, type KlineChartApi } from "./TradingView";
import { CoinSelector } from "./CoinSelector";
import { KlineStats } from "./KlineStats";
import { OrderBook } from "./OrderBook";
import { RecentTrades } from "./RecentTrades";
import { useKline } from "./useKline";
import { useKlineTrade } from "./useKlineTrade";
import {
  DEFAULT_COIN,
  DEFAULT_INTERVAL,
  UI_INTERVALS,
  isUiInterval,
  type UiInterval,
} from "./intervalConfig";

const MOBILE_TABS = ["Chart", "Orderbook", "Trades"] as const;
type MobileTab = (typeof MOBILE_TABS)[number];

function isValidCoin(value: string | null): value is string {
  return !!value && /^[A-Za-z0-9:.]{1,32}$/.test(value);
}

export function KlineView() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawCoin = searchParams.get("coin");
  const coin = isValidCoin(rawCoin) ? rawCoin : DEFAULT_COIN;
  const rawInterval = searchParams.get("interval");
  const interval: UiInterval = isUiInterval(rawInterval ?? "")
    ? (rawInterval as UiInterval)
    : DEFAULT_INTERVAL;

  const [mobileTab, setMobileTab] = useState<MobileTab>("Chart");
  const chartApiRef = useRef<KlineChartApi | null>(null);

  const {
    candles,
    coinList,
    loading,
    error,
    olderLoading,
    exhausted,
    epoch,
    loadOlder,
  } = useKline(coin, interval, (c) => chartApiRef.current?.update(c));

  const trade = useKlineTrade(coin);

  const navigate = (nextCoin: string, nextInterval: string) => {
    const params = new URLSearchParams();
    params.set("coin", nextCoin);
    params.set("interval", nextInterval);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const chartPanel = (
    <div className="flex min-w-0 flex-1 flex-col">
      {loading && candles.length === 0 && (
        <p className="py-6 text-center font-mono text-sm text-faint">
          {t("kline.loading")}
        </p>
      )}
      {loading && candles.length > 0 && (
        <div className="mb-2 inline-flex items-center gap-2 border-[3px] border-border bg-accent px-3 py-1.5 font-mono text-xs font-bold text-on-accent">
          <span className="inline-block size-3 animate-spin border-2 border-on-accent/30 border-t-on-accent" />
          {t("kline.refreshing")}
        </div>
      )}
      {error && (
        <div className="mb-3 break-all border-[3px] border-border bg-error px-3 py-2 font-mono text-xs text-on-accent">
          ✗ {error}
        </div>
      )}
      {olderLoading && (
        <p className="mb-2 inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-xs font-bold text-on-accent">
          {t("kline.loadingOlder")}
        </p>
      )}
      {exhausted && candles.length > 0 && (
        <p className="mb-2 font-mono text-xs text-faint">{t("kline.oldest")}</p>
      )}
      <TradingView
        candles={candles}
        apiRef={chartApiRef}
        resetKey={epoch}
        onNeedOlder={(from) => loadOlder(from, candles.length)}
      />
    </div>
  );

  const sidePanel = (
    <div className="flex w-[280px] shrink-0 flex-col overflow-hidden border-l border-border">
      <div className="border-b border-border">
        <OrderBook data={trade.orderBook} />
      </div>
      <div className="flex-1 overflow-y-auto">
        <RecentTrades trades={trade.trades} />
      </div>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-6 lg:px-6 lg:py-10">
      {/* 标题区 */}
      <header className="mb-4">
        <p className="inline-block border-2 border-border bg-accent px-2 py-0.5 font-mono text-sm font-bold text-on-accent">
          {"// WEB3"} {t("web3.features.klineTitle")}
        </p>
        <h1 className="mt-2 font-bold tracking-tight text-text">
          {t("web3.features.klineTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("web3.features.klineDesc")}
        </p>
      </header>

      {/* 24h 统计栏 */}
      <div className="mb-4 border-y border-border bg-surface/30">
        <KlineStats stats={trade.stats} />
      </div>

      {/* 切换器 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 font-mono text-xs text-faint">
            {t("kline.intervalLabel")}
          </span>
          {UI_INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              disabled={loading}
              onClick={() => navigate(coin, iv)}
              aria-pressed={iv === interval}
              className={`border-[3px] px-2.5 py-1 font-mono text-xs font-bold transition-all duration-100 disabled:pointer-events-none disabled:opacity-40 ${
                iv === interval
                  ? "bg-text text-bg shadow-neu-sm"
                  : "bg-surface text-muted hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-on-accent hover:shadow-neu-sm active:translate-x-px active:translate-y-px active:shadow-none"
              } ${iv === interval ? "" : "border-border"}`}
            >
              {iv}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-faint">
            {t("kline.coinLabel")}
          </span>
          <CoinSelector
            value={coin}
            coinList={coinList}
            onSelect={(nextCoin) => navigate(nextCoin, interval)}
          />
        </div>
      </div>

      {/* 移动端：tabs */}
      <div className="mb-2 flex gap-2 lg:hidden">
        {MOBILE_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            className={`border-[3px] px-2.5 py-1 font-mono text-xs font-bold ${
              mobileTab === tab
                ? "bg-text text-bg shadow-neu-sm"
                : "border-border bg-surface text-muted"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 主体区域 */}
      <div className="flex flex-col lg:flex-row">
        {/* 移动端隐藏 */}
        <div className={`lg:hidden ${mobileTab === "Chart" ? "block" : "hidden"}`}>
          {chartPanel}
        </div>
        {/* 桌面端：左侧 chart flex-1 + 右侧面板 */}
        <div className="hidden lg:flex lg:flex-1">{chartPanel}</div>

        {/* 右侧 OrderBook + RecentTrades */}
        <div className={`lg:w-[280px] lg:shrink-0 ${mobileTab !== "Chart" ? "block" : "hidden"} lg:block`}>
          {mobileTab === "Orderbook" ? (
            <div className="lg:block">
              <div className="border-b border-border">
                <OrderBook data={trade.orderBook} />
              </div>
            </div>
          ) : mobileTab === "Trades" ? (
            <div className="max-h-[600px] overflow-y-auto lg:block">
              <RecentTrades trades={trade.trades} />
            </div>
          ) : (
            <div className="hidden lg:block">{sidePanel}</div>
          )}
        </div>
      </div>
    </main>
  );
}