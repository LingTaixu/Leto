# Design

## Context

- 现状 K 线用 lightweight-charts（`components/kline/*`：useKline/formatKline/TradingView/KlineView/intervalConfig），实时 WSS 与历史分页均已实现（已完成并归档于 kline-live-trading）。
- 仓库根已内置 `charting_library/`（完整 TradingView Charting Library：`charting_library.d.ts`、`charting_library.js/esm/cjs`、`datafeeds/`、`themed.css`），chef_cooking-city-web 用同一库 + datafeed 模式已实证（`widget` + `IBasicDataFeed`）。
- `@nktkas/hyperliquid` 已装：`candleSnapshot`（HttpTransport）与 `SubscriptionClient.candle`（WebSocketTransport，spike 已验证）。i18n/URL/server wrapper/明暗令牌就绪。
- Charting Library 为 TradingView 免费开放但需 attribution（NOTICE + tradingview.com 链接）。

## Goals / Non-Goals

**Goals:**
- K 线渲染换为 Charting Library widget；Hyperliquid datafeed 提供历史分页 + WSS 实时；周期用 TV 内建工具栏，币种保留自绘选择器；URL `?coin=&interval=` 保留；明暗跟随主站令牌；`bun remove lightweight-charts`。

**Non-Goals:**
- 不做 Gecko/jup.ag 数据源；不迁移 chef 其他 UI（未使用的 Wallet 等）；不保留 lightweight-charts 实现。

## Decisions

### D1. 静态资源与库路径

`cp -r charting_library public/charting_library`（去 node_modules/示例），`library_path: "/charting_library/"`；`datafeeds/udf` 用不到（用自写 datafeed），保留目录无害。Page 静态输出（`○`）下该 public 路径在 build 直接可访问。

### D2. Hyperliquid datafeed（`hyperliquidDatafeed.ts`）

```
resolveSymbol(name)  → symbolInfo { name, pricescale: 1e9, session: "24x7",
                        supported_resolutions: ["1","5","15","60","240","1D"], streaming: true, ... }
getBars(symbolInfo, resolution, {from,to,countBack}, onResult)
  → candleSnapshot({ coin: name, interval: map[resolution],
                     startTime: (to-countBack*sec), endTime: to*1000 })
  → _bars = 格式化升序; onResult(bars, { noData })
  (TV 滚动回看 → 再调 getBars(from/to) —— 历史分页原生达成)
subscribeBars(..., onTick)  → SubscriptionClient.candle({coin, interval}, e =>
    合并 _bars：同 t 替换(o/h/l/c) 或追加 → onTick(bar))   // WSS，无 React 渲染
unsubscribeBars / onReady(cb)   // cleanup: unsubscribe + cancelled
```

沿用 kline-live-trading 已验证的 upsert/归属校验/退订逻辑；`s`/`i` 校验防切换串台。

### D3. resolution ↔ interval 与主题（`chartConfig.ts`）

`map: { "1":"1m","5":"5m","15":"15m","60":"1h","240":"4h","1D":"1d" }`，`timeFrameOptions` 对应。主题：初始 `loading_options`/`overrides` 用令牌色（浅 `#fafafa`/`#18181b`、暗 `#09090b`/`#fafafa`、蜡烛 `#ef5350`/`#26a69a`），明暗切换 `chart.applyOptions({ theme })`（监听 `prefers-color-scheme`，chef 用 custom.css 同理）。

### D4. 币种切换 + URL

币种：自绘 `<select>`（allMids，perp），切换 `widget.chart().setSymbolName(coin)`（TV 自动 resolveSymbol→getBars→subscribeBars，datafeed 读 coinRef）；同时 `router.replace(?coin=&interval=)`。周期：TV 内建 resolution 按钮；`subscribeResolutionChange` 同步 URL `interval`。初始从 URL 恢复 coin/interval（`useSearchParams`+Suspense）。默认 ETH/1h。

### D5. 移除 lightweight-charts

`bun remove lightweight-charts`；删除 `TradingView.tsx`/`useKline.ts`（其职责并入 datafeed）；`formatKline.ts` 保留（`formatSingleCandle`/`formatWsCandle` 复用于 datafeed），`intervalConfig.ts` 折叠进 chartConfig。

### D6. 服务端安全 / i18n

KlineView 保持 client + Suspense wrapper（page.tsx 不动）；页面级 loading/最早提示等少量文案仍走 messages（`kline.*`），周期/币种标签改由 TV 工具栏呈现可精简。

## Risks / Trade-offs

- [Charting Library 许可/版权] → 保留 NOTICE + tradingview 链接（license 要求）。
- [widget 体积大] → 静态 public 加载，首屏 K 线页按需拉取；接受。
- [setSymbolName 触发全流程可能慢] → 提供轻 loading 态；datafeed coinRef 即时更新。
- [TV 内建 resolution 与自绘 select 共存] → 明确周期走 TV、币种走 select，避免双入口。
- [明暗切换同步] → 初始令牌 + `applyOptions({theme})`；TV 主题为内置 dark/light，令牌接近即可（不逐像素对齐）。

## Migration Plan

1. `cp -r charting_library public/charting_library`；`bun remove lightweight-charts`。
2. `chartConfig.ts`（map/timeFrames/overrides）+ `hyperliquidDatafeed.ts`。
3. `KlineView` 改 widget 容器 + 币种 select + URL + 主题监听；page.tsx 不动。
4. 删除 `TradingView.tsx`/`useKline.ts`（逻辑已并入 datafeed），保留 formatKline。
5. lint/tsc/build + dev 冒烟 + 手动验证（周期/币种/实时/历史分页/主题/URL）。
6. 回滚：恢复 lightweight-charts 组件 + 依赖。

## Open Questions

无（方向、数据源、归属、主题、URL、去除 lw 均已定）。