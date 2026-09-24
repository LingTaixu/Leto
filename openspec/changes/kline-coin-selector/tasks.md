# Tasks

## 1. 选择器组件

- [x] 1.1 实现 `components/kline/CoinSelector.tsx`：触发按钮 + 浮层面板 + 搜索框 + 列表；点击外部关闭（document listener）/ Esc 关闭；neubrutalism 样式；验证 `bunx tsc --noEmit` 通过
- [x] 1.2 行数据：`coin`、24h 涨跌幅（正负颜色）、24h 成交量，来自 `metaAndAssetCtxs()`（与 KlineStats 同源，首载缓存）

## 2. 数据层

- [x] 2.1 `useKline.ts` 币种列表从 `allMids()` 改为 `InfoClient.meta()` 的 `universe.map(u=>u.name)`，剔除 `@`/`#` 污染键，失败不阻塞

## 3. 布局与限高

- [x] 3.1 `OrderBook.tsx` 外层加 `max-h-[420px] overflow-y-auto`；`RecentTrades.tsx` 外层加 `max-h-[260px] overflow-y-auto`，验证内容超出后内部滚动不拉伸页面
- [x] 3.2 `KlineView.tsx` 用 `CoinSelector` 替换原生 `<select>`，选择后 `navigate(coin, interval)`、URL 同步、联动图表/盘口/统计栏

## 4. 验证

- [x] 4.1 `bun run build` + `bunx tsc --noEmit` + `bun run lint` 通过
- [x] 4.2 手动验证：选择器搜索/选中/外部关闭、币种列表无 `@`/`#` 项、24h 涨跌与量展示、OrderBook/RecentTrades 限高滚动