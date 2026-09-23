# Design

## Context

`charting_library` v25.002 已在 leto 根目录与 chef_cooking-city-web 同版本，chef 三件套（`index.tsx`/`datafeed.ts`/`options.ts`）展示了 TV widget 初始化与 `IBasicDataFeed` 的完整模式。leto 现用 lightweight-charts 自绘（`KlineView`+`useKline`+`TradingView.tsx`），`useKline` 已实现 Hyperliquid 快照 + WSS 实时 + 币种列表，`formatKline` 完成快照与 WSS 格式化。上一变更 `kline-charting-library` 规划完成但 0/10 任务未实现即归档，主 spec `kline-chart` 已同步为 TV 版。

## Goals / Non-Goals

**Goals:**
- chef 式三件套移植：widget 容器 + Hyperliquid datafeed + resolution/interval 配置
- 切换币种/周期/主题均不销毁 widget（`setCoin`+`setSymbolName` / TV 工具栏 / `setTheme`）
- `lightweight-charts` 依赖与 `TradingView.tsx` 删除，`bun run build` 通过

**Non-Goals:**
- 不迁 GeckoTerminal/jup 数据源、不迁 chef 的 header/indicator 无关功能集
- 不迁移 URL 语义、i18n 文案键、`/web3/kline` 入口

## Decisions

- **D1 资源与依赖**: `charting_library/` 拷入 `public/charting_library/`（`library_path: "/charting_library/"`），`bun remove lightweight-charts`；`eslint.config.mjs` ignores 已完成。备选: 保留根目录由 webpack 打包（会污染 bundle，不可取）。
- **D2 datafeed 可变数据源**（与 chef 唯一架构偏差）: chef 构造时固定 `tokenAddress`、每次重建 widget；leto datafeed 持 `_coin`，KlineView select 变更先 `datafeed.setCoin(coin)` 再 `widget.chart().setSymbolName(coin)`，widget 全程只建一次。
- **D3 分页与实时**: `getBars` 用 `candleSnapshot({coin,interval,startTime:end*1000,endTime:to*1000})`，`bar.time` 毫秒；`subscribeBars` 订阅 WSS `candle({coin,interval})` 推 `onTick`（省去 chef 的 5s 轮询与手动 `_bars` 合并），`unsubscribeBars` 退订。`useKline` 的 `loadOlder` 分页删除（TV 原生分页）。
- **D4 resolution 映射**: 六档 `1,5,15,60,240,1D` ↔ Hyperliquid `1m,5m,15m,1h,4h,1d`；周期切换走 TV 内建工具栏，`onIntervalChanged` 回写 `?interval=`，URL 仍为唯一状态源（读方向初始化消费，写方向 TV 事件驱动——单向依赖，已确认）。
- **D5 主题与 locale**: `matchMedia` 变化 → `widget.setTheme("light"|"dark")`，色值沿用现有轻/暗令牌色（`#fafafa`/`#09090b` 对应背景），蜡烛色红涨绿跌 `#ef5350`/`#26a69a`；`locale` 由 `[locale]` 映射 TV 支持的 `zh`/`en`。备选: chef 的固定 `custom_css_url` 深色主题（不能跟随系统明暗，弃用）。

## Risks / Trade-offs

- [TV 非开源，license 归 TradingView] → 仅本地分发，保留 attribution；不对外宣称开源
- [TV 分页与 WSS 合并的时序竞争] → `subscribeBars` 内按 `time` upsert，与 `getBars` 结果以 TV 内部 `_bars` 为准
- [setSymbolName 触发重新 resolveSymbol/getBars 可能短暂白屏] → datafeed 缓存上一批 bars，切换期间先渲染缓存
- [Removing lightweight-charts breaks nothing else?] → grep 确认仅 `components/kline/TradingView.tsx` 引用

## Migration Plan

1. 拷资源 + 删依赖 → 2. datafeed+options+widget 容器 → 3. KlineView 接线（select/URL/主题）→ 4. `bun run build` + `bun run dev` 手动验证（渲染/滚动缩放/币种切换/周期回写/明暗主题/WSS 实时）→ 5. 删除 `TradingView.tsx`

## Open Questions

- `pricescale` 精度：Hyperliquid 币种价格小数位数不一（BTC/ETH vs 小币种），chef 固定 `pricescale=1e9`+`toFixed(9)` 已知可行，先按固定精度，若小币种出现价格刻度不整数再引入动态 `pricescale`（不影响 spec，仅实现细节）。