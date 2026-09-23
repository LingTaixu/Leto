# Spec Delta

## Purpose

在 web3 功能实验室提供 Hyperliquid K 线图表：拉取 ETH 1 小时 K 线数据并以 lightweight-charts 蜡烛图渲染，明暗主题适配主站设计令牌。

## MODIFIED Requirements

### Requirement: K 线数据获取

系统 SHALL 通过 `@nktkas/hyperliquid` 的 `candleSnapshot` 按给定 `coin`/`interval` 拉取 K 线数据，默认 `ETH`/`1h`；并以 `IBasicDataFeed` 的 `getBars(from/to/countBack)` 提供历史分页（滚动回看时按区间补取更早数据）；并 SHALL 将其格式化为图表库所需结构（open/high/low/close 与秒级 time）。币种列表 SHALL 取自 `InfoClient.allMids()` 的 `mids` 键（perp）。

#### Scenario: 加载时拉取数据

- **WHEN** 用户打开 K 线页
- **THEN** 页面按当前 coin/interval（默认 ETH / 1h）拉取历史 K 线并准备渲染

#### Scenario: 数据格式化

- **WHEN** 拿到 SDK 的 candle 快照
- **THEN** 每个蜡烛转换为 `{ open, high, low, close, time }`（millis→秒）

#### Scenario: 币种列表拉取

- **WHEN** 页面初始化
- **THEN** 通过 `InfoClient.allMids()` 取得币种列表供选择器使用

### Requirement: K 线渲染

系统 SHALL 使用 TradingView Charting Library 的 widget 渲染蜡烛图，展示 K 线并支持滚动、缩放、周期切换（TV 内建 resolution 工具栏）与时间框架；蜡烛颜色 SHALL 为红涨绿跌（`#ef5350` / `#26a69a`）；渲染 SHALL 由 datafeed（`getBars`/`subscribeBars`/`onTick`）驱动，不触发放大 React 重渲染。

#### Scenario: 渲染蜡烛图

- **WHEN** 数据就绪
- **THEN** 图表显示蜡烛（涨跌色），可滚动/缩放/切换周期查看不同范围

#### Scenario: 支持滚动与缩放

- **WHEN** 用户在图表上拖拽或滚轮操作
- **THEN** 图表平移与缩放正常响应

#### Scenario: 数据更新不重建图表

- **WHEN** 快照刷新或实时更新发生
- **THEN** 图表实例保持，仅经 datafeed 更新数据（缩放位置不丢失）

### Requirement: 历史数据懒加载

用户滚到历史边缘时系统 SHALL 通过 `getBars`（`from/to/countBack`）请求更早区间 K 线并渲染，TV 分页为原生行为；到达最老边界或已无更多数据时 SHALL 停止加载。

#### Scenario: 滚动到历史边缘触发加载

- **WHEN** 用户向左滚动使可见范围接近已加载数据起点
- **THEN** 请求更早区间数据并渲染，视点保持不跳

#### Scenario: 最老边界停止

- **WHEN** 已加载到合约首根且向前区间返回空
- **THEN** 停止加载更早数据

#### Scenario: 加载中不重复请求

- **WHEN** 上一批加载仍在进行或已达边界
- **THEN** 不发起重复请求（并发锁）