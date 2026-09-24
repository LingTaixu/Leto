"use client";

import {
  CandlestickData,
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  HistogramSeries,
  createChart,
  type IChartApi,
  type Time,
} from "lightweight-charts";
import { useEffect, useRef, type RefObject } from "react";
import type { candlestickData } from "./formatKline";
import { LOAD_THRESHOLD } from "./intervalConfig";

/** 图表 imperative 操作器：WSS 实时更新直通 series.update，不触发 React 渲染 */
export interface KlineChartApi {
  update: (candle: candlestickData) => void;
}

/** 初始可见根数与右侧留白根数（timeScale().setVisibleLogicalRange 指定） */
const INITIAL_VISIBLE_BARS = 100;
const RIGHT_OFFSET_BARS = 3;

/** 成交量副窗格高度（px） */
const VOLUME_PANE_HEIGHT = 120;

/** 交易所风格配色：绿涨红跌 */
const UP = "#26a69a";
const DOWN = "#ef5350";
const UP_VOLUME = "rgba(38, 166, 154, 0.55)";
const DOWN_VOLUME = "rgba(239, 83, 80, 0.55)";

const LIGHT = {
  textColor: "#18181b",
  bg: "#fafafa",
  grid: "#e4e4e7",
  crosshair: "#a1a1aa",
  border: "#d4d4d8",
  muted: "#71717a",
};

type LegendData = {
  time?: number | Time;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};

function formatLegend(d: LegendData, mutedColor: string): string {
  if (d.open === undefined || d.close === undefined) return "";
  const up = d.close >= d.open;
  const color = up ? UP : DOWN;
  const chg = d.open !== 0 ? ((d.close - d.open) / d.open) * 100 : 0;
  const fmt = (n?: number) =>
    n === undefined
      ? "—"
      : n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  const vol =
    d.volume === undefined
      ? "—"
      : d.volume.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return (
    `<span style="color:${mutedColor}">O</span> <span style="color:${color}">${fmt(d.open)}</span>` +
    `<span style="color:${mutedColor}">H</span> <span style="color:${color}">${fmt(d.high)}</span>` +
    `<span style="color:${mutedColor}">L</span> <span style="color:${color}">${fmt(d.low)}</span>` +
    `<span style="color:${mutedColor}">C</span> <span style="color:${color}">${fmt(d.close)}</span>` +
    `<span style="color:${color}">${up ? "+" : ""}${chg.toFixed(2)}%</span>` +
    `<span style="color:${mutedColor}">Vol</span> <span style="color:${mutedColor}">${vol}</span>`
  );
}

/**
 * K 线图表渲染（数据与渲染解耦，交易所风格）：
 * - 蜡烛主窗格 + 成交量副窗格（pane 1）
 * - 十字线 OHLC + 涨跌幅 + 成交量图例（左上角，离开恢复最新根）
 * - chart 随容器建一次，卸载才 remove；主题变化 → applyOptions（不重建）
 * - 快照/前插 → setData + 可见范围策略；WSS → series.update 直通
 * - 滚到历史边缘 → onNeedOlder（前插分页）
 */
export function TradingView({
  candles,
  apiRef,
  resetKey = 0,
  onNeedOlder,
}: {
  candles: candlestickData[];
  apiRef?: RefObject<KlineChartApi | null>;
  /** 快照替换标识（切换/新参数时递增）→ 重置初始可见范围；增量(前插)不变 */
  resetKey?: number;
  /** 可见范围滚到历史边缘时回调（触发分页加载） */
  onNeedOlder?: (from: number) => void;
}) {
  // 站点为固定浅色主题：图表不响应 prefers-color-scheme（spec: 纯色主题不做暗黑模式切换）
  const theme = LIGHT;

  const containerRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(
    null,
  );
  const volumeSeriesRef = useRef<ReturnType<IChartApi["addSeries"]> | null>(
    null,
  );

  // 十字线是否在图内（离开 → 图例回退最新根）
  const crosshairActiveRef = useRef(false);
  // 最新一根（十字线离开时回显）
  const latestRef = useRef<candlestickData | undefined>(undefined);
  // 主题色 ref（图例渲染闭包读取，避免重建图表）
  const themeRef = useRef(theme);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  // 数据视图状态：上一批 total 与可见范围（前插时平移补偿，滚动位置不跳）
  const viewRef = useRef<{
    total: number;
    range: { from: number; to: number } | null;
    resetKey: number | null;
  }>({ total: 0, range: null, resetKey: null });

  // 回调走 ref（避免闭包 stale）
  const onNeedOlderRef = useRef(onNeedOlder);
  useEffect(() => {
    onNeedOlderRef.current = onNeedOlder;
  });

  const renderLegend = (d: LegendData | undefined) => {
    const el = legendRef.current;
    if (!el) return;
    el.innerHTML = d ? formatLegend(d, themeRef.current.muted) : "";
  };

  // 建图（仅容器生命周期）
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        textColor: themeRef.current.textColor,
        background: { type: ColorType.Solid, color: themeRef.current.bg },
        attributionLogo: false,
      },
      grid: {
        vertLines: { color: themeRef.current.grid },
        horzLines: { color: themeRef.current.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: themeRef.current.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: themeRef.current.border,
        },
        horzLine: {
          color: themeRef.current.crosshair,
          width: 1,
          style: 2,
          labelBackgroundColor: themeRef.current.border,
        },
      },
      rightPriceScale: {
        borderColor: themeRef.current.border,
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      timeScale: {
        borderColor: themeRef.current.border,
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // 蜡烛主窗格（pane 0）
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderVisible: false,
      wickUpColor: UP,
      wickDownColor: DOWN,
      priceLineColor: UP,
      priceLineWidth: 1,
      priceLineStyle: 2,
    });
    candleSeriesRef.current = candleSeries;

    // 成交量副窗格（pane 1）
    const volumeSeries = chart.addSeries(
      HistogramSeries,
      {
        priceFormat: { type: "volume" },
        priceScaleId: "volume",
        color: UP_VOLUME,
      },
      1,
    );
    volumeSeriesRef.current = volumeSeries;
    volumeSeries.priceScale().applyOptions({
      visible: false,
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    const panes = chart.panes();
    if (panes.length > 1) panes[1]!.setHeight(VOLUME_PANE_HEIGHT);

    // 十字线 OHLC 图例
    chart.subscribeCrosshairMove((param) => {
      const candleData = param.seriesData.get(candleSeries) as
        | CandlestickData
        | undefined;
      if (!param.time || !candleData) {
        crosshairActiveRef.current = false;
        renderLegend(latestRef.current);
        return;
      }
      crosshairActiveRef.current = true;
      const volData = param.seriesData.get(volumeSeries) as
        | { value?: number }
        | undefined;
      renderLegend({
        time: Number(param.time),
        open: candleData.open,
        high: candleData.high,
        low: candleData.low,
        close: candleData.close,
        volume: volData?.value,
      });
    });

    const rangeHandler = (r: { from: number; to: number } | null) => {
      if (!r) return;
      viewRef.current.range = r;
      if (r.from <= LOAD_THRESHOLD) {
        onNeedOlderRef.current?.(r.from);
      }
    };
    chart.timeScale().subscribeVisibleLogicalRangeChange(rangeHandler);

    chartRef.current = chart;
    if (apiRef) {
      apiRef.current = {
        update: (candle) => {
          // 守卫：series.update 只允许更新"最新一根"。WSS 会重放历史根
          // （重连/拖动触发前插时），早于已加载最新根的必须丢弃——
          // 历史区间已由 setData 覆盖，update 喂更老根会抛
          // "Cannot update oldest data"。
          const latest = latestRef.current;
          if (latest && Number(candle.time) < Number(latest.time)) return;

          candleSeriesRef.current?.update(candle as CandlestickData);
          volumeSeriesRef.current?.update({
            time: candle.time as Time,
            value: candle.volume,
            color: candle.close >= candle.open ? UP_VOLUME : DOWN_VOLUME,
          });
          latestRef.current = candle;
          if (!crosshairActiveRef.current) renderLegend(candle);
        },
      };
    }

    return () => {
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(rangeHandler);
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
      if (apiRef) apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 仅随容器创建一次
  }, []);

  // 主题变化 → applyOptions（不销毁图表，缩放位置保留）—— 主题固定浅色，仅挂载时应用一次
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      layout: {
        textColor: theme.textColor,
        background: { type: ColorType.Solid, color: theme.bg },
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      crosshair: {
        vertLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.border,
        },
        horzLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.border,
        },
      },
      rightPriceScale: { borderColor: theme.border },
      timeScale: { borderColor: theme.border },
    });
    if (!crosshairActiveRef.current) renderLegend(latestRef.current);
  }, [theme]);

  // 数据变化 → setData + 可见范围策略
  // - resetKey 变化（切换/新快照）→ 初始可见范围（最近 100 根 + 右侧留白）
  // - 增量前插（历史分页）→ 可见范围右移 added，内容视点保持
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;
    if (candles.length === 0) return;
    const chart = chartRef.current;
    if (!chart) return;
    const ts = chart.timeScale();
    const view = viewRef.current;
    const isSnapshot = view.resetKey !== resetKey;
    const added = candles.length - view.total;

    candleSeriesRef.current.setData(candles as CandlestickData[]);
    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as Time,
        value: c.volume,
        color: c.close >= c.open ? UP_VOLUME : DOWN_VOLUME,
      })),
    );

    if (isSnapshot) {
      ts.setVisibleLogicalRange({
        from: Math.max(0, candles.length - INITIAL_VISIBLE_BARS),
        to: candles.length - 1 + RIGHT_OFFSET_BARS,
      });
      view.resetKey = resetKey;
    } else if (added > 0 && view.range) {
      ts.setVisibleLogicalRange({
        from: view.range.from + added,
        to: view.range.to + added,
      });
    }

    view.total = candles.length;
    view.range = ts.getVisibleLogicalRange();

    latestRef.current = candles[candles.length - 1];
    if (!crosshairActiveRef.current) renderLegend(latestRef.current);
  }, [candles, resetKey]);

  return (
    <div className="relative">
      {/* OHLC 图例（交易所风格左上角报价） */}
      <div
        ref={legendRef}
        className="pointer-events-none absolute left-3 top-2 z-10 flex flex-wrap gap-x-3 font-mono text-xs"
      />
      <div style={{ width: "100%", height: "55vh" }} ref={containerRef} />
    </div>
  );
}
