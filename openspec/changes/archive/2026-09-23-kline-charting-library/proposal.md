# Proposal

## Why

当前 K 线使用 `lightweight-charts`（功能简单、需自绘大量交互）。仓库已内置完整 **TradingView Charting Library**（对标 chef_cooking-city-web 的 chart 集成方式，SDK 同源），其自带头部工具栏、周期切换、K 线缩放滚动、时间框架、全屏、自定义 CSS 主题等专业能力，且 `getBars`/`subscribeBars` 提供**原生历史分页**与实时通道。将 K 线渲染从 lightweight-charts 切换到 Charting Library，并为其编写 Hyperliquid datafeed。

## What Changes

- 新增 `public/charting_library/` 静态资源（由仓库根 `charting_library/` 拷入）与 `library_path: "/charting_library/"`。
- 新增 `components/kline/hyperliquidDatafeed.ts`：实现 `IBasicDataFeed`——`resolveSymbol`（perp symbolInfo + `supported_resolutions`）、`getBars`（`candleSnapshot` 按 `from/to/countBack` 分页，TV 原生历史懒加载）、`subscribeBars`（复用 `WebSocketTransport` candle 订阅 + `_bars` 合并 `onTick`，`s/i` 归属校验、退订收口）、`unsubscribeBars`/`onReady`。
- 新增 `components/kline/chartConfig.ts`：TV resolution ↔ Hyperliquid interval 映射（`1/5/15/60/240/1D` ↔ `1m/5m/15m/1h/4h/1d`）、`timeFrameOptions`、主题 `overrides`（蜡烛红绿 `#ef5350`/`#26a69a`、背景/文字取主站令牌、`custom_css_url`）。
- `components/kline/KlineView.tsx` 改为 widget 容器（memo + `useEffect` + `useRef`，chef 模式）；币种选择器保留（`widget.chart().setSymbolName(coin)` 或重建 datafeed），URL `?coin=&interval=` 状态保留，明暗切换 `chart.applyOptions`/theme。
- 移除 `lightweight-charts` 依赖；`bun remove lightweight-charts`。
- **Non-goals**：不引入 chef 的 jup.ag/Gecko 数据源；不迁移 chef 自定义 timeZone 文案以外的其余 UI；不保留 lightweight-charts 组件（整体替换）。

## Capabilities

### New Capabilities

<!-- 无 -->

### Modified Capabilities

- `kline-chart`: K 线渲染引擎由 lightweight-charts 换为 TradingView Charting Library（widget + datafeed）；历史懒加载由 `getBars(countBack)` 原生承担；数据获取/格式化/币种源/URL/实时 upsert 行为保持。

## Impact

- 代码：`public/charting_library/**`（新增静态资源）、`components/kline/{KlineView,hyperliquidDatafeed,chartConfig}.ts`（重写/新增）、`app/[locale]/web3/kline/page.tsx`（Suspense wrapper 保持）、`eslint.config.mjs`（已有 ignores，保留）。
- 依赖：移除 `lightweight-charts`；保留 `@nktkas/hyperliquid`。
- 外部：Charting Library 为 TradingView 商业许可的免费开放库（需保留 attribution）；`wss://api.hyperliquid.xyz/ws` 实时（已 spike 通过）。
- spec：`kline-chart` 3 条 MODIFIED（K 线数据获取 / K 线渲染 / 历史数据懒加载）。