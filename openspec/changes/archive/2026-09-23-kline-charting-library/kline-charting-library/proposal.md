# Proposal

## Why

当前 K 线页用 lightweight-charts 自绘渲染，交互（周期工具栏、历史分页、指标等）都要手写维护。chef_cooking-city-web 项目已用 TradingView Charting Library（v25.002）稳定渲染，将其棋式移植到 leto，用 Hyperliquid datafeed 驱动，获得成熟的图表交互并显著减少自研渲染代码。上一变更 `kline-charting-library` 曾完成规划但未实现，本变更重新创建并吸收探索期新的设计决策。

## What Changes

- **BREAKING**: 渲染引擎从 lightweight-charts 更换为 TradingView Charting Library（`charting_library`，根目录已有 v25.002 全量分发，需拷入 `public/charting_library/`）；删除 `TradingView.tsx` 的 lightweight-charts 实现与 `lightweight-charts` 依赖
- 新增 Hyperliquid datafeed（chef `GeckoTerminalDataFeed` 同构）：`resolveSymbol`/`getBars`/`subscribeBars`/`unsubscribeBars`/`onReady`，取数 `@nktkas/hyperliquid` 的 `candleSnapshot` + WSS `candle`
- `bar.time` 用毫秒（对齐 chef 与 TV v25.002）
- 周期走 TV 内建 resolution 工具栏，`onaIntervalChanged` 回写 `?interval=`（URL 仍为唯一状态源，单向依赖）
- 币种保留自绘 select，切换走 `datafeed.setCoin()` + `widget.chart().setSymbolName()`，widget 全程只建一次（不重建、缩放位置不丢）
- 主题跟随系统明暗偏好，`widget.setTheme()` 生效，明暗自适应复用现有轻/暗令牌色
- resolution 六档 `1,5,15,60,240,1D` 映射 Hyperliquid `1m,5m,15m,1h,4h,1d`
- TV 沿用 chef 的 `disabled_features`/`enabled_features` 与 `overrides`（红涨绿跌 `#ef5350`/`#26a69a`）

## Capabilities

### New Capabilities
- 无

### Modified Capabilities
- `kline-chart`: K 线数据获取改为 `getBars` 历史分页、K 线渲染改为 TV widget+datafeed 驱动、历史数据懒加载改为 TV 原生分页

## Impact

- 删除: `components/kline/TradingView.tsx`（lightweight-charts 版）、`package.json` 的 `lightweight-charts` 依赖
- 保留复用: `components/kline/KlineView.tsx`（URL 状态/币种 select/提示条）、`formatKline.ts`（快照与 WSS 格式化）、`useKline.ts`（重构为 datafeed 取数层，`loadOlder` 分页逻辑删除）
- 新增: `components/kline/tv/{datafeed.ts,options.ts}`、TV widget 容器组件
- 资源: 根 `charting_library/` 拷贝至 `public/charting_library/`；`eslint.config.mjs` ignores（已完成）
- 主 spec `openspec/specs/kline-chart/spec.md` 已同步为 TV 版，本 config 的 delta 与其保持标题一致