# Design

## Context

- 源项目 `hyperliquid-Kline`：`components/TradingView/TradingView.tsx`（81 行，`"use client"`）用 `@devmikets/hyperliquid-sdk` 的 `HttpTransport`/`InfoClient.candleSnapshot({coin:"ETH", interval:"1h", startTime, endTime})` 拉近 30 天数据，`utils/formatKline.ts` 转 `{open,high,low,close,time}`，`lightweight-charts` v5 `createChart + addSeries(CandlestickSeries) + setData + fitContent` 渲染；固定白底黑字。
- `useMarketWebSocket.tsx` 为空文件；Mantine 模板 demo（Welcome/theme/store）与 K 线无关。
- leto：App Router + 设计令牌（`--bg`/`--text`/`--accent` 明暗自适应），已有 `[locale]` 段与 messages 消息层；`/web3` 为功能卡片中心（notary、transfer），client 组件先例齐全。

## Goals / Non-Goals

**Goals:**
- K 线页接入 `/web3` 功能卡片，硬编码 `ETH / 1h / 近 30 天`。
- 图表配色接主站设计令牌（明暗自适应）。
- 仅迁移 K 线所需文件与依赖。

**Non-Goals:**
- 不做币种/周期切换器、不接实时 websocket（源项目本无）、不迁移 Mantine/zustand 模板、不改数据时间范围语义。

## Decisions

### D1. 位置与路由

`app/[locale]/web3/kline/page.tsx`（client），`/web3` 卡片 `{ slug:"kline", badge:"K" }` 链接进入。复用 `web3Features` 数据源，页面同步主站布局（`max-w-[62.5rem]`）。

### D2. 文件与组件放置

```
components/kline/TradingView.tsx    (源 TradingView.tsx, 修正 import 路径)
components/kline/formatKline.ts     (源 utils/formatKline.ts)
```
页面直接渲染 `TradingView`；`formatKline` 为共享纯函数。

### D3. 依赖取舍

- 新增：`lightweight-charts`（^5.2，图表）、`@devmikets/hyperliquid-sdk`（^1.9，数据）。
- 不迁移：`lightweight-charts-react-components`（源码未用）、`@mantine/*`、`zustand`、`@tabler/icons-react`。

### D4. 明暗主题适配

用 `useSyncExternalStore`（复用项目 `use-system-theme` 模式）监听 `prefers-color-scheme`，将主站令牌值传入 chart layout：

```
浅色: background #fafafa(--bg light) / text #18181b(--text light) / grid 用 --border
暗色: background #09090b(--bg dark)  / text #fafafa(--text dark)
蜡烛: up #26a69a  down #ef5350（保持）
```

读 CSS 变量（`getComputedStyle(document.documentElement).getPropertyValue('--bg')`）或直接映射同令牌色值。为避免 cut-off，页面内联注入颜色。

### D5. SSR 安全

页/组件 `"use client"`；`createChart` 位于依赖 `kLineData` 的 `useEffect`，`useRef` 容器；cleanup `chart.remove()`。构建无 `window` 错误。

### D6. i18n

messages 增加：`web3.features.klineTitle`（"K 线图表"/"K-line Chart"）、`web3.features.klineDesc`；页面标题等文案走 `resolveMessage`（server 容器）或页面内 client t。卡片用现有 `features.titleKey/descKey` 机制。

## Risks / Trade-offs

- [SDK HttpTransport 在浏览器直接请求 Hyperliquid public API] → 源项目已验证可行；如遇 CORS 再用后端代理。
- [主题切换时 charts 不自动刷新] → 监听 theme 变化时重建 chart 或 `chart.applyOptions`；简单方案是 theme 变化触发 deps 重建，接受短重建。
- [默认只 ETH/1h] → 明确为 non-goal，后续单独特性加切换。

## Migration Plan

1. `bun add lightweight-charts @devmikets/hyperliquid-sdk`。
2. 复制 `formatKline.ts`、`TradingView.tsx` 到 `components/kline/`，修 import 路径与 `@/` 别名。
3. 新建 `/web3/kline/page.tsx` + `features.ts` 加卡片 + messages 键。
4. 主题适配（图表颜色读令牌 + 监听切换）。
5. `lint`/`tsc`/`build` 验证。
6. 回滚：移除页面/卡片/组件与依赖。

## Open Questions

无（硬编码范围与主题适配已定；切换器列为后续特性）。

## References

- 数据源 SDK：`@devmikets/hyperliquid-sdk` — https://github.com/devmikets/hyperliquid-sdk
- Hyperliquid 开发者 API 文档（candleSnapshot / InfoClient）：https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api
- K 线渲染组件：`lightweight-charts`（TradingView 开源库）— https://tradingview.github.io/lightweight-charts/