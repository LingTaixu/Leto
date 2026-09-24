# Design

## Context

kline 页币种选择当前为原生 `<select>`，数据源 `allMids()`（1103 键）混入 `@` spot 指数与 `#` 预测市场键，无法展示行情；桌面侧栏 OrderBook/RecentTrades 父容器无固定高度，内容随之无限拉伸。参考 app.hyperliquid.xyz/trade 的 CoinSelector 交互（按钮 → 浮层面板 → 搜索 → 行含行情）。

## Goals / Non-Goals

**Goals:**
- neubrutalism 风格的弹出式币种选择器（触发按钮 + 浮层 + 搜索）
- 数据源为 `meta().universe` 234 纯 perp 合约，剔除 `@`/`#` 污染
- 每行展示：合约名 + 24h 涨跌幅（颜色标识）+ 24h 成交量
- OrderBook / RecentTrades 面板限高，内部滚动

**Non-Goals:**
- 不接入 Spot 交易（spike 已证 spot candleSnapshot 返回空，仅 perp 可交易）
- 不引入第三方 UI 库

## Decisions

- **D1 选择器数据**: `InfoClient.meta()` 返回 234 项 `{ name, szDecimals, maxLeverage }`；每行行情来自 `metaAndAssetCtxs()`（同 useKlineTrade 已拉的 stats 源，复用而非再请求）。
- **D2 交互形态**: `CoinSelector.tsx` 组件——触发按钮（显示当前合约名 + 下箭头）→ 点击开/关浮层 → 顶部搜索框（受控 input）→ 列表 `filter(name.includes(q))` → 行点击 `navigate(coin, interval)`。点击外部自动关闭（document mousedown listener + ref 判断）。
- **D3 样式**: 沿用 kline 页既有 neubrutalism token（`--accent` 黄、`--border` 黑、`border-[3px]`、`shadow-neu`）。行情正负色复用交易面板绿/红（`#26a69a`/`#ef5350`）。
- **D4 限高**: `OrderBook` 外层 `max-h-[420px] overflow-y-auto`；`RecentTrades` 外层 `max-h-[260px] overflow-y-auto`（含表头 sticky）；两者不随内容拉伸。
- **D5 useKline 币种列表**: 从 `allMids()` 改为 `meta()`（`.universe.map(u=>u.name)`），保留失败不阻塞语义；coinList 仍给 KlineView 作 URL 校验回退。

## Risks / Trade-offs

- [浮层遮挡图表/布局] → 浮层 `absolute` 相对触发按钮容器定位，`z-30`
- [meta() 每切币种重拉?] → 选择器数据只在首载请求一次并缓存（模块级），不随切换重拉
- [行情行数据量大(234行)渲染] → 列表虚拟不必要，234 行 filter 后最多全量渲染，可控

## Migration Plan

1. `CoinSelector.tsx`（数据 + 交互）
2. `useKline.ts` 改 `meta()`
3. `OrderBook.tsx` / `RecentTrades.tsx` 限高
4. `KlineView.tsx` 替换 `<select>` + 布局接线
5. tsc / lint / build / 手动验证