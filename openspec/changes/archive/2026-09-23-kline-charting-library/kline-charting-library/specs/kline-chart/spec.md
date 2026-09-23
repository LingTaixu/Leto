# Spec Delta

## MODIFIED Requirements

### Requirement: K 线数据获取

系统 SHALL 通过 `@nktkas/hyperliquid` 的 `candleSnapshot` 按给定 `coin`/`interval` 拉取近 30 天的 K 线数据，默认 `ETH`/`1h`；并 SHALL 将其格式化为图表库所需结构（open/high/low/close 与秒级 time）。币种列表 SHALL 取自 `InfoClient.allMids()` 的 `mids` 键（perp）。

#### Scenario: 加载时拉取数据

- **WHEN** 用户打开 K 线页
- **THEN** 页面按当前 coin/interval（默认 ETH / 1h）拉取近 30 天 K 线并准备渲染

#### Scenario: 数据格式化

- **WHEN** 拿到 SDK 的 candle 快照
- **THEN** 每个蜡烛转换为 `{ open, high, low, close, time }`（millis→秒）

#### Scenario: 币种列表拉取

- **WHEN** 页面初始化
- **THEN** 通过 `InfoClient.allMids()` 取得币种列表供选择器使用

### Requirement: K 线渲染

系统 SHALL 使用 lightweight-charts 渲染蜡烛图，以交易所风格展示 K 线并支持滚动、缩放与周期切换；蜡烛颜色 SHALL 为红涨绿跌（`#ef5350` / `#26a69a`）；图表 SHALL 提供成交量副窗格（pane）与十字线报价图例（hover 显示该根 opens 当根，离开图表恢复最新根）；渲染与数据解耦：历史快照用 `series.setData`、实时单根用 `series.update`（只更新最新末根，弃早于已加载最新根的历史根）、主题变化用 `chart.applyOptions`，SHALL NOT 因数据/主题变化销毁重建图表（容器卸载除外）。

#### Scenario: 渲染蜡烛图

- **WHEN** 数据就绪
- **THEN** 图表显示蜡烛（涨跌色），可滚动/缩放/周期切换查看不同范围

#### Scenario: 成交量副窗格与图例

- **WHEN** 用户查看图表并在上方移动十字线
- **THEN** 成交量副窗格随蜡烛更新，左上角图例显示 OHLC、涨跌幅与成交量，离开图表后图例恢复为最新一根

#### Scenario: 数据更新不重建图表

- **WHEN** 快照刷新或实时更新发生
- **THEN** 图表实例保持，仅更新 series 数据或布局选项，缩放位置不丢失

### Requirement: 历史数据懒加载

用户滚到历史边缘时系统 SHALL 请求更早一批 K 线（`candleSnapshot` 以最早根为 `endTime` 向前取一窗口）并前插渲染；前插 SHALL 平移可见逻辑范围以保持用户视点不跳（不触发展开额外 React 渲染）；前插合并 SHALL 对时间戳去重并保持严格时间升序，早于已加载最新根的数据须丢弃；到达最老边界或已无更多数据时 SHALL 停止加载并提示"已到最早数据"。

#### Scenario: 滚动到历史边缘触发加载

- **WHEN** 用户向左滚动使可见 `from` 低于阈值
- **THEN** 请求更早一批数据，前插渲染且视点保持不跳

#### Scenario: 最老边界停止

- **WHEN** 已加载到合约首根且再向前请求返回空
- **THEN** 停止加载并提示"已到最早数据"

#### Scenario: 加载中不重复请求

- **WHEN** 上一批加载仍在进行或已达边界
- **THEN** 不发起重复请求（并发锁）