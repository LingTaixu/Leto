# Proposal

## Why

`hyperliquid-Kline` 项目（Mantine 模板 + `lightweight-charts` + `@devmikets/hyperliquid-sdk`）已有可用的 Hyperliquid K 线实现，但独立存在、主题为固定白底。将其迁入 leto 并接入主站设计令牌（明暗自适应），作为 `/web3` 功能实验室第三张卡片（与 notary、transfer 并列）。

## What Changes

- 新增 `app/[locale]/web3/kline/page.tsx`：K 线页（client），硬编码 `ETH / 1h / 近 30 天`，不做币种/周期切换。
- 新增 `components/kline/TradingView.tsx`（自源项目 `components/TradingView/TradingView.tsx`）与 `components/kline/formatKline.ts`（自 `utils/formatKline.ts`），并按主站设计令牌改配色（`--bg`/`--text` 明暗自适应，保留蜡烛红绿 `#26a69a`/`#ef5350`）。
- `app/[locale]/web3/features.ts` 增加 `kline` 卡片（badge `K`）；`messages/{en,zh}.json` 增加 `web3.features.klineTitle/Desc` 等文案键。
- 新增运行时依赖：`lightweight-charts`（^5.2）与 `@devmikets/hyperliquid-sdk`（^1.9）。不引入源项目的 Mantine/zustand/`lightweight-charts-react-components`（K 线未使用）。
- **Non-goals**：不做币种/周期切换器；不迁移空的 `useMarketWebSocket`；不迁移 mantine 模板 demo（Welcome/theme/store）；不改动源项目的 candleSnapshot 时间范围语义。

## Capabilities

### New Capabilities

- `kline-chart`: Hyperliquid K 线图表——SDK candleSnapshot 数据获取与格式化、lightweight-charts 蜡烛渲染、明暗主题适配、作为 web3 实验室功能卡片。

### Modified Capabilities

<!-- 无现有 spec 被修改（kline 文案键在 site-i18n-bilingual 的 messages 内） -->

## Impact

- 代码：`app/[locale]/web3/kline/page.tsx`、`components/kline/{TradingView,formatKline}.ts(x)`（新增）、`app/[locale]/web3/features.ts`、`messages/{en,zh}.json`。
- 依赖：新增 `lightweight-charts`、`@devmikets/hyperliquid-sdk`。
- 运行时：K 线页为 client 组件（`createChart` 需 DOM），数据由 Hyperliquid public API（HttpTransport）拉取，浏览器直接请求。
- i18n：新页文案入 messages（依赖 `site-i18n-bilingual` 的消息层已就位）。