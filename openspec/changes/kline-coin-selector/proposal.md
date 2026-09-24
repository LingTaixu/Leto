# Proposal

## Why

当前 kline 页币种选择是原生 `<select>`，数据源 `allMids()` 混入 416 个 `@` spot 指数与数百个 `#` 预测市场键（共 1103 键），选择器被污染且无法展示价格/涨跌；OrderBook 与 RecentTrades 面板在桌面侧栏因父容器无固定高度被内容无限拉伸。参考 app.hyperliquid.xyz/trade：用 `meta.universe`（234 个纯 perp 合约）构建搜索面板式选择器，并给交易面板设置高度的上限。

## What Changes

- 新增弹出式币种选择器（参考官方 CoinSelector，neubrutalism 风格）：触发按钮 + 浮层面板 + 顶部搜索框；每行渲染 `name`、24h 涨跌幅、24h 成交量（数据源 `meta()`+`metaAndAssetCtxs()`）
- 数据源从 `allMids()` 改为 `meta().universe`（234 纯 perp 合约，剔除 `@`/`#` 污染键）
- OrderBook 面板限高（固定高度 + `overflow-y-auto`）；RecentTrades 限高（max-h + scroll）
- 选择币种仍走 `?coin=` URL 状态与图表/盘口联动更新

## Capabilities

### New Capabilities
- 无

### Modified Capabilities
- `kline-chart`: 「币种与周期切换」改为由搜索面板选择器驱动（隐藏预测市场/spot 指数，展示涨跌与成交量）；「K 线渲染」补充交易面板（OrderBook/RecentTrades）高度上限

## Impact

- 修改: `components/kline/KlineView.tsx`（选择器替换 `<select>`）、`components/kline/useKline.ts`（币种列表改用 meta()）
- 新增: `components/kline/CoinSelector.tsx`
- 修改: `components/kline/OrderBook.tsx`、`components/kline/RecentTrades.tsx`（限高）
- 依赖: 复用现有 `@nktkas/hyperliquid` 的 `InfoClient.meta()`；无新增依赖