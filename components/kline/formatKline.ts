import type { CandleWsEvent, CandleSnapshotResponse } from "@nktkas/hyperliquid";
import { Time } from "lightweight-charts";

export interface candlestickData {
  open: number;
  high: number;
  low: number;
  close: number;
  time: number | Time;
  volume: number;
}

export const formatSingleCandle = (
  candleSnapshot: CandleSnapshotResponse,
): candlestickData[] => {
  return candleSnapshot.map((data) => {
    return {
      open: Number(data.o),
      high: Number(data.h),
      low: Number(data.l),
      close: Number(data.c),
      time: (data.t / 1000) as Time,
      volume: Number(data.v),
    };
  });
};

/** WSS candle 事件 → 图表结构（o/h/l/c/v 可能为 string，统一 Number） */
export const formatWsCandle = (event: CandleWsEvent): candlestickData => {
  return {
    open: Number(event.o),
    high: Number(event.h),
    low: Number(event.l),
    close: Number(event.c),
    time: (event.t / 1000) as Time,
    volume: Number(event.v),
  };
};