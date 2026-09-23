# Proposal

## Why

`/web3/kline` 目前为硬编码单币种（ETH/1h/近30天）：数据与渲染耦合、`kLineData`/`theme` 变化即全量重建 chart、无切换能力、无实时数据，且依赖的 `@devmikets/hyperliquid-sdk` 非目标 SDK（应换为 `@nktkas/hyperliquid`）。要让 K 线成为真正可用的图表：支持币种/周期切换（URL 可分享）并接入 WSS 实时蜡烛。

## What Changes

- **阶段一（骨架 + 切换）**：
  - 依赖替换：`bun remove @devmikets/hyperliquid-sdk && bun add @nktkas/hyperliquid`，全部 import 迁移（API 同构：`HttpTransport`/`InfoClient`/`candleSnapshot`）。
  - 拆分数据与渲染：新增 `useKline(coin, interval)` hook（快照拉取 + 状态），`TradingView` 改为增量渲染——chart 只随容器/主题用 `applyOptions`，数据用 `series.setData`/`series.update`，不再因数据变化 `remove()+createChart()`。
  - 切换器 UI：周期档位（从 WS 文档 14 档中选取常用：1m/5m/15m/1h/4h/1d）+ 币种选择器，币种列表**动态获取自 `allMids`**（`InfoClient.allMids()` 的 `mids` keys，过滤 perp）。
  - URL 状态：`?coin=&interval=` 保存当前选择，刷新与分享不丢失（client `useSearchParams` + Suspense，切换时 `router.replace`）。
- **阶段二（WSS 实时）**：
  - 前置 spike：浏览器直连 `wss://api.hyperliquid.xyz/ws`（`WebSocketTransport`）验证 origin/兼容性；失败则记录阻塞、本阶段暂停。
  - `SubscriptionClient.candle({coin, interval}, listener)` 实时订阅；单根更新走 **upsert**（`t` 相同替换最后一根，跨时间插入）；按 `CandleEvent.s/.i` 校验消息归属；切换/卸载 `unsubscribe()`（effect cleanup 收口），依赖 SDK 自带断线重连 + 自动重订阅。
- **Non-goals**：不做下单/交易、不做深度图/成交量副图、不做 ticker 行情条（可后续）、不引入其他行情源。历史数据支持滚动懒加载（见 specs）。

## Capabilities

### New Capabilities

<!-- 无 -->

### Modified Capabilities

- `kline-chart`: 数据获取改为按 `coin/interval` 参数化并替换 SDK 为 `@nktkas/hyperliquid`；渲染改为增量更新（实时/切换不重建）；新增币种与周期切换、URL 状态保留、WSS 实时蜡烛三项需求。

## Impact

- 代码：`components/kline/{TradingView,KlineView}.tsx` 重构、新增 `useKline.ts`/`coinList.ts`/`intervalConfig.ts`、`app/[locale]/web3/kline/page.tsx`（Suspense + searchParams）；i18n 新增切换器文案键（zh/en）。
- 依赖：移除 `@devmikets/hyperliquid-sdk`，新增 `@nktkas/hyperliquid`（全程 bun）。
- 外部：Hyperliquid mainnet WSS（`wss://api.hyperliquid.xyz/ws`，spike 验证）与 `allMids` 数据源（文档：websocket subscriptions）。
- spec：`kline-chart` 5 条需求中 2 条 MODIFIED + 3 条新增 ADDED。
