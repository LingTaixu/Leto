# Tasks

## 1. 资源与依赖

- [x] 1.1 拷贝根 `charting_library/`（含 `charting_library.d.ts`、`datafeeds/`、`themed.css`）至 `public/charting_library/`，验证 `public/charting_library/charting_library/charting_library.esm.js` 存在
- [x] 1.2 `bun remove lightweight-charts` 并 grep 全仓确认无 `lightweight-charts` import 残留（`components/kline/TradingView.tsx` 待删属正常）

## 2. Datafeed 与配置

- [x] 2.1 实现 `components/kline/tv/options.ts`：`intervalMap` 六档 `1,5,15,60,240,1D ↔ 1m,5m,15m,1h,4h,1d`、`timeFrameOptions`，验证映射键与 `intervalConfig.UI_INTERVALS` 覆盖一致
- [x] 2.2 实现 `components/kline/tv/datafeed.ts`：`resolveSymbol` 静态构造（`pricescale`、`supported_resolutions`、`has_intraday`）、`getBars` 调 `candleSnapshot`（periodParams from/to 秒→毫秒，`bar.time` 毫秒）、`onReady` 返回六档，验证返回结构符合 `IBasicDataFeed` 类型（`bunx tsc --noEmit` 通过）
- [x] 2.3 datafeed 实现可变数据源：`setCoin()` + `getBars/subscribeBars/resolveSymbol` 读最新 `_coin`；`subscribeBars` 订阅 Hyperliquid WSS `candle` 推 `onTick`（按 `time` upsert）、`unsubscribeBars` 退订，验证切换币种后 WSS 事件归属正确、无泄漏

## 3. Widget 容器与接线

- [x] 3.1 实现 TV widget 容器组件（`charting_library` import、`library_path: "/charting_library/"`、chef 式 `disabled_features`/`enabled_features`/`overrides` 红涨绿跌），验证 `bun run build` 通过无 `window is not defined`
- [x] 3.2 `KlineView` 接线：币种 select → `datafeed.setCoin()` + `widget.chart().setSymbolName()`，TV `onIntervalChanged` 回写 `?interval=`，URL 仍为唯一状态源，验证切换后 URL 与图表状态一致且 widget 未重建（缩放位置不丢）
- [x] 3.3 主题接线：`matchMedia` 变化 → `widget.setTheme()`，明暗下背景/文字沿用主站令牌色，验证切换系统明暗偏好图表跟随
- [x] 3.4 删除 `components/kline/TradingView.tsx` 与 `useKline` 中 `loadOlder` 分页逻辑（TV 原生分页），验证 `KlineView` 不再渲染 `olderLoading`/`exhausted` 分页提示

## 4. 验证

- [x] 4.1 `bun run build` 通过，无 hydration/`window is not defined` 错误，`bunx tsc --noEmit` 通过
- [ ] 4.2 手动验证：渲染蜡烛、滚动缩放、六档周期切换回写 URL、币种切换不重建、明暗主题、WSS 实时蜡烛最后一根原地更新、历史滚动至最老边界停止加载