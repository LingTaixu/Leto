# Tasks

## 1. 资源与依赖

- [ ] 1.1 复制 `charting_library/` → `public/charting_library/`（不含 node_modules/示例），`bun remove lightweight-charts`；验证 `bunx tsc --noEmit` 通过
- [ ] 1.2 `eslint.config.mjs` 已 ignores `charting_library/`（根与 public 都覆盖）；验证 `bun run lint` 不扫该库

## 2. 数据层与配置

- [ ] 2.1 新建 `components/kline/chartConfig.ts`：TV resolution ↔ interval 映射（`1/5/15/60/240/1D` ↔ `1m/5m/15m/1h/4h/1d`）、`timeFrameOptions`、主题 `overrides`（浅 `#fafafa`/`#18181b`、暗 `#09090b`/`#fafafa`、蜡烛 `#ef5350`/`#26a69a`）、`custom_css_url`；验证导出类型
- [ ] 2.2 新建 `components/kline/hyperliquidDatafeed.ts`：`IBasicDataFeed`——`resolveSymbol`（perp symbolInfo、`supported_resolutions`）、`getBars`（`candleSnapshot` by `from/to/countBack` → `formatSingleCandle`）、`subscribeBars`（`SubscriptionClient.candle` + `_bars` 合并 `onTick`，`s/i` 校验、cleanup 退订）、`unsubscribeBars`/`onReady`；验证 `bunx tsc --noEmit` 通过

## 3. widget 容器与页面

- [ ] 3.1 `components/kline/KlineView.tsx` 改 widget 容器（`memo`+`useEffect`+`useRef`）：`new widget({ datafeed, container, library_path:"/charting_library/", interval, time_frames, theme overrides, timezone })`，cleanup `datafeed` 退订 + `widget.remove()`；删除 `TradingView.tsx`/`useKline.ts`（逻辑并入 datafeed，保留 `formatKline.ts`）；验证 `/zh/web3/kline` 渲染
- [ ] 3.2 币种选择器（`allMids` perp）+ 切换 `widget.chart().setSymbolName(coin)` 与 `router.replace(?coin=&interval=)`；周期走 TV 内建 resolution，`subscribeResolutionChange` 同步 URL `interval`；URL 初始恢复（`useSearchParams`+Suspense，默认 ETH/1h）；验证切换与分享恢复
- [ ] 3.3 明暗跟随：初始 `overrides` 取令牌色，`prefers-color-scheme` 变化 `chart.applyOptions({ theme })`；验证明暗切换图表配色跟随

## 4. 验证

- [ ] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [ ] 4.2 运行 `bun run build` 成功：`/[locale]/web3/kline` 生成、`/charting_library/` 静态资源可达、无 `window is not defined`
- [ ] 4.3 手动验证：加载 ETH/1h 蜡烛、滚动回看自动分页更早数据且不跳、1m 实时原地更新、TV 工具栏切周期同步 URL、币种 select 切换、明暗跟随、`?coin=&interval=` 分享恢复