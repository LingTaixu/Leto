# Tasks

## 1. 数据层

- [x] 1.1 实现 `components/kline/useKlineTrade.ts`：`l2Snapshot()` + `l2Book` WSS 订阅（snapshot 全量 / changes 增量合并）、`recentTrades()` + `trades` WSS 订阅（push + cap 100）、`metaAndAssetCtxs()` 统计（按 coin 映射涨跌幅/OI/资金费率/成交量），验证 `bunx tsc --noEmit` 通过
- [x] 1.2 `useKlineTrade` 暴露 `{orderBook, recentTrades, stats, loading}`，当 coin 变化时重拉快照/重订阅 WSS，卸载退订，不泄漏连接

## 2. 组件

- [x] 2.1 实现 `components/kline/OrderBook.tsx`：买卖盘双向列表（各 15+ 档），每行价格/数量/深度占比 css bar，买入绿/卖出红，WSS 增量更新无闪烁
- [x] 2.2 实现 `components/kline/RecentTrades.tsx`：成交列表（顶最新），每行价格（涨跌色）数量时间，cap 100 条
- [x] 2.3 实现 `components/kline/KlineStats.tsx`：标题栏当前价/涨跌幅/成交量/OI/资金费率，响应系统主题色

## 3. 布局接线

- [x] 3.1 重构 `KlineView.tsx`：三栏布局（左 OrderBook / 中蜡烛图 / 右 RecentTrades），标题栏下 KlineStats；响应式 (<1024px tabs 切换)
- [x] 3.2 `KlineView` 将当前 coin/interval 传入 `useKlineTrade`，切换币种时自动更新三个面板

## 4. 验证

- [x] 4.1 `bun run build` + `bunx tsc --noEmit` + `bun run lint` 通过
- [x] 4.2 手动验证：OrderBook 加载/实时增量、RecentTrades 推送/涨跌色、Stats 切换币种更新、响应式布局