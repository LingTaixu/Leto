"use client";

import { useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { TradingView, type KlineChartApi } from "./TradingView";
import { useKline } from "./useKline";
import {
  DEFAULT_COIN,
  DEFAULT_INTERVAL,
  UI_INTERVALS,
  isUiInterval,
  type UiInterval,
} from "./intervalConfig";

function isValidCoin(value: string | null): value is string {
  return !!value && /^[A-Za-z0-9:.]{1,32}$/.test(value);
}

export function KlineView() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL 为唯一状态源（刷新/分享不丢）
  const rawCoin = searchParams.get("coin");
  const coin = isValidCoin(rawCoin) ? rawCoin : DEFAULT_COIN;
  const rawInterval = searchParams.get("interval");
  const interval: UiInterval = isUiInterval(rawInterval ?? "")
    ? (rawInterval as UiInterval)
    : DEFAULT_INTERVAL;

  const chartApiRef = useRef<KlineChartApi | null>(null);

  // WSS 实时蜡烛 → imperative 直通图表（不触发 React 重渲染）
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

  const navigate = (nextCoin: string, nextInterval: string) => {
    const params = new URLSearchParams();
    params.set("coin", nextCoin);
    params.set("interval", nextInterval);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <main className="mx-auto w-full max-w-[90rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      <header className="mb-6">
        <p className="font-mono text-sm text-accent">
          {"// WEB3"} {t("web3.features.klineTitle")}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-text">
          {t("web3.features.klineTitle")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {t("web3.features.klineDesc")}
        </p>
      </header>

      {/* 切换器：周期 + 币种 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 font-mono text-xs text-faint">
            {t("kline.intervalLabel")}
          </span>
          {UI_INTERVALS.map((iv) => (
            <button
              key={iv}
              type="button"
              onClick={() => navigate(coin, iv)}
              aria-pressed={iv === interval}
              className={`border-[3px] border-border px-2.5 py-1 font-mono text-xs font-bold transition-all duration-100 ${
                iv === interval
                  ? "bg-text text-bg shadow-neu-sm"
                  : "bg-surface text-muted hover:-translate-x-px hover:-translate-y-px hover:bg-accent hover:text-on-accent hover:shadow-neu-sm active:translate-x-px active:translate-y-px active:shadow-none"
              }`}
            >
              {iv}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2">
          <span className="font-mono text-xs text-faint">
            {t("kline.coinLabel")}
          </span>
          <select
            value={coin}
            onChange={(e) => navigate(e.target.value, interval)}
            className="rounded-none border-[3px] border-border bg-surface px-3 py-1.5 font-mono text-sm text-text focus:outline-3 focus:outline-accent focus:outline-offset-2"
          >
            {coinList.length === 0 && <option value={coin}>{coin}</option>}
            {!coinList.includes(coin) && coinList.length > 0 && (
              <option value={coin}>{coin}</option>
            )}
            {coinList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

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

      {/* 历史分页状态 */}
      {olderLoading && (
        <p className="mb-2 font-mono text-xs text-accent">
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
    </main>
  );
}