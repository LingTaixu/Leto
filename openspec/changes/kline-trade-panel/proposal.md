# Proposal

## Why

当前 kline 页仅有蜡烛图与成交量副窗格，与真实交易所交易页（如 app.hyperliquid.xyz/trade）相比缺乏关键市场数据面板（order book 深度、近期成交、24h 统计）。补全这些数据源使 kline 页更像一个交易所风格交易界面。

## What Changes

- 新增 Order Book 面板（买方/卖方深度队列），数据源 `InfoClient.l2Snapshot()` + WSS `l2Book`
- 新增 Recent Trades 面板（实时成交列表），数据源 `InfoClient.recentTrades()` + WSS `trades`
- 新增 24h 统计栏（当前价格、涨跌幅、成交量、持仓量、资金费率），数据源 `InfoClient.metaAndAssetCtxs()`
- 上述面板均与现有 KlineView 同页布局（三栏式：左 order book / 中蜡烛 | 右 recent trades，统计栏在标题区）

## Capabilities

### New Capabilities
- `kline-trade-data`: 为 kline 页提供交易数据面板（order book、recent trades、24h 统计），数据取自 Hyperliquid API

### Modified Capabilities
- 无（kline-chart 的行为不改变，仅同一页面增加面板组件）

## Impact

- 新增: `components/kline/{OrderBook.tsx,RecentTrades.tsx,KlineStats.tsx,useKlineTrade.ts}`
- 修改: `components/kline/KlineView.tsx`（布局重构为多栏）
- 依赖: `@nktkas/hyperliquid` 的 `SubscriptionClient.l2Book` / `trades`（SDK 已有，无需新增依赖）