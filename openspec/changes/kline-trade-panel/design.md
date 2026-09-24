# Design

## Context

kline 页现有蜡烛图（lightweight-charts）+ 成交量子窗格 + 十字线图例，数据源为 `@nktkas/hyperliquid` 的 `candleSnapshot` + WSS `candle`。本次新增三个交易数据面板，数据源复用同一 SDK 的 `l2Snapshot`/`l2Book`、`recentTrades`/`trades`、`metaAndAssetCtxs`。布局参照 app.hyperliquid.xyz/trade 的三栏结构。

## Goals / Non-Goals

**Goals:**
- Order Book（买卖盘各 15+ 档，增量 WSS 合并）
- Recent Trades（实时成交列表，50+ 条）
- 24h Stats（价格/涨跌幅/成交量/OI/资金费率）
- 三面板均随币种切换自动更新

**Non-Goals:**
- 下单操作（交易功能超出 scope）
- Order Book 全量重构（仅深度显示，不涉及撮合逻辑）

## Decisions

- **D1 数据源与实时性**: 复用 `@nktkas/hyperliquid` SDK 的 `InfoClient.l2Snapshot()` / `SubscriptionClient.l2Book()`、`InfoClient.recentTrades()` / `SubscriptionClient.trades()`、`InfoClient.metaAndAssetCtxs()`。SDK 已安装且 spikes 已验证 WSS 通道可用。
- **D2 布局**: 三栏式：左 Order Book（~38%）| 中蜡烛图（flex-1）| 右 Recent Trades（~38%），24h 统计栏在标题区/图例区。响应式：< 1024px 时折叠为单行可滚动 tabs。
- **D3 Order Book 合并策略**: l2Book 事件 `type: "snapshot"` 替换全量，`type: "changes"` 按 price 遍历 upsert（已存在→更新，不存在→插入）；管理 LRU 保持档位数。超时 30s 无推送标记 stale。
- **D4 Recent Trades 合并**: trades 事件直接 push 到列表头部，cap 100 条；价格颜色对比前一条（tick 判断涨跌色）。
- **D5 统计栏**: `metaAndAssetCtxs()` 返回所有币种的数组，按 coin 映射取出 `funding`、`openInterest`、`dayVolume` 等。按 `markPx` 比 `prevDayPx` 计算 24h 涨跌幅。WSS `subscriptionClient` 的 `allMids` 更新时重新计算涨跌幅（无需另订阅）。

## Risks / Trade-offs

- [l2Book WSS 增量合并复杂] → 用 `Map<price, level>` 维护档位，changes 事件对每个价格做 `set`/`delete`
- [同时维护 3 个 WSS 订阅可能超限] → SDK 单条 WebSocket 支持多订阅，无需额外连接
- [移动端响应式三栏拥挤] → 使用内联 tabs 切换（Order Book / Recent Trades / 图表），移动优先 CSS

## Migration Plan

1. `useKlineTrade.ts`：数据层（l2Snapshot/recentTrades/metaAndAssetCtxs + WSS l2Book/trades）
2. `OrderBook.tsx`、`RecentTrades.tsx`、`KlineStats.tsx`
3. `KlineView.tsx` 布局重构为三栏
4. build/tsc/lint 验证