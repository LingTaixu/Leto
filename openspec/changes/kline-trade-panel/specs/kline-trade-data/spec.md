# Spec Delta

## Purpose

为 K 线页补充交易所级交易数据面板（Order Book 深度、近期成交、24h 统计），数据取自 Hyperliquid API 与 WSS 订阅，与蜡烛图同页展示。

## ADDED Requirements

### Requirement: 24h 统计栏

K 线页标题区 SHALL 展示当前币种的 24h 统计：最新价格（实时更新）、24h 涨跌幅（百分比与颜色标识）、24h 成交量、持仓量（OI）、资金费率。数据 SHALL 来自 `InfoClient.metaAndAssetCtxs()`，WSS `subscriptionClient` 更新。

#### Scenario: 统计栏展示

- **WHEN** 用户打开 K 线页
- **THEN** 标题区显示当前币种的价格、涨跌幅、成交量、持仓量、资金费率

#### Scenario: 切换币种更新统计

- **WHEN** 用户切换币种
- **THEN** 统计栏切换为对应币种的数据

### Requirement: Order Book 深度

系统 SHALL 展示当前币种的 Order Book 队列（买方/卖方各至少 15 档深度），首次加载来自 `InfoClient.l2Snapshot()`，实时更新来自 WSS `l2Book` 事件（增量合并）。买方标绿色，卖方标红色，需显示每档价格与总量，并可视化深度占比（css bar）。

#### Scenario: 加载 Order Book

- **WHEN** 打开 K 线页或切换币种
- **THEN** 显示买方/卖方队列，每档展示价格、数量、累计深度占比

#### Scenario: 实时更新

- **WHEN** WSS `l2Book` 推送增量事件
- **THEN** Order Book 队列按价格去重/插入/删除，界面无闪烁

### Requirement: Recent Trades

系统 SHALL 展示当前币种的近期成交列表（至少 50 条），首次加载来自 `InfoClient.recentTrades()`，实时更新来自 WSS `trades` 事件。每行展示成交价格（涨跌色）、数量、时间。价格高于前一条标记上涨色，低于标记下跌色。

#### Scenario: 加载近期成交

- **WHEN** 打开 K 线页或切换币种
- **THEN** 显示近期成交列表，最新成交在顶部

#### Scenario: 实时推送

- **WHEN** WSS `trades` 推送新成交事件
- **THEN** 新成交插入列表顶部，保留不超过 100 条