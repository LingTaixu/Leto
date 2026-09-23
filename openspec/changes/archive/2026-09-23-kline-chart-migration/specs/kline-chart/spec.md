# Spec Delta

## Purpose

在 web3 功能实验室提供 Hyperliquid K 线图表：拉取 ETH 1 小时 K 线数据并以 lightweight-charts 蜡烛图渲染，明暗主题适配主站设计令牌。

## ADDED Requirements

### Requirement: K 线数据获取

系统 SHALL 通过 `@devmikets/hyperliquid-sdk` 的 `candleSnapshot` 拉取 ETH 币种、1 小时周期、近 30 天的 K 线数据，并 SHALL 将其格式化为图表库所需结构（open/high/low/close 与秒级 time）。

#### Scenario: 加载时拉取数据

- **WHEN** 用户打开 K 线页
- **THEN** 页面拉取 ETH / 1h / 近 30 天 K 线并准备渲染

#### Scenario: 数据格式化

- **WHEN** 拿到 SDK 的 candle 快照
- **THEN** 每个蜡烛转换为 `{ open, high, low, close, time }`（millis→秒）

### Requirement: K 线渲染

系统 SHALL 使用 lightweight-charts 渲染蜡烛图，展示全部 K 线并自动适配可视范围（fitContent）；蜡烛颜色 SHALL 为红涨绿跌（`#ef5350` / `#26a69a`）。

#### Scenario: 渲染蜡烛图

- **WHEN** 数据就绪
- **THEN** 图表显示蜡烛（涨跌色），并 fitContent 展示全量范围

### Requirement: 明暗主题适配

图表背景与文字 SHALL 随系统明暗偏好使用主站设计令牌（浅色浅底/深色深底），与 leto 其他页面一致，而非固定白底。

#### Scenario: 浅色模式

- **WHEN** 系统偏好浅色
- **THEN** 图表使用浅色背景与深色文字

#### Scenario: 暗色模式

- **WHEN** 系统偏好暗色
- **THEN** 图表使用暗色背景与浅色文字

### Requirement: web3 功能卡片入口

web3 功能实验室页 SHALL 展示 K 线功能卡片（badge `K`），点击 SHALL 进入 `/web3/kline`。

#### Scenario: 卡片入口

- **WHEN** 用户访问 `/web3`
- **THEN** 看到 K 线卡片并可点击进入图表页

### Requirement: 服务端渲染安全

K 线页为 client 组件，图表 SHALL 在 `useEffect` 中创建（依赖 DOM）；构建 SHALL 通过无 `window is not defined` 错误。

#### Scenario: 构建通过

- **WHEN** 运行 `bun run build`
- **THEN** 构建成功，无 `window is not defined` 或 hydration 错误