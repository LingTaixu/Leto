# Spec Delta

## MODIFIED Requirements

### Requirement: K 线渲染

系统 SHALL 使用 lightweight-charts 渲染蜡烛图，以交易所风格展示 K 线并支持滚动、缩放与周期切换；蜡烛颜色 SHALL 为绿涨红跌（`#26a69a` / `#ef5350`）；图表 SHALL 提供成交量副窗格（pane）与十字线报价图例（hover 显示该根 opens 当根，离开图表恢复最新根）；渲染与数据解耦：历史快照用 `series.setData`、实时单根用 `series.update`（只更新最新末根，弃早于已加载最新根的历史根）、主题变化用 `chart.applyOptions`，SHALL NOT 因数据/主题变化销毁重建图表（容器卸载除外）。与蜡烛同页的交易面板（Order Book / Recent Trades）SHALL 设高度上限并在高度内滚动，SHALL NOT 随内容数量无限拉伸页面布局。

#### Scenario: 渲染蜡烛图

- **WHEN** 数据就绪
- **THEN** 图表显示蜡烛（涨跌色），可滚动/缩放/周期切换查看不同范围

#### Scenario: 成交量副窗格与图例

- **WHEN** 用户查看图表并在上方移动十字线
- **THEN** 成交量副窗格随蜡烛更新，左上角图例显示 OHLC、涨跌幅与成交量，离开图表后图例恢复为最新一根

#### Scenario: 数据更新不重建图表

- **WHEN** 快照刷新或实时更新发生
- **THEN** 图表实例保持，仅更新 series 数据或布局选项，缩放位置不丢失

#### Scenario: 交易面板高度受限于内部滚动

- **WHEN** Order Book 或 Recent Trades 内容超过面板高度上限
- **THEN** 面板保持固定高度并在高度内滚动，不拉伸整体页面

### Requirement: 币种与周期切换

系统 SHALL 提供币种与周期切换器（neubrutalism 风格搜索面板）：周期档位至少含 `1m/5m/15m/1h/4h/1d`；币种列表 SHALL 取自 `InfoClient.meta().universe`（纯 perp 合约，不包含 `@` 开头的 spot 指数与 `#` 开头的预测市场键），切换后 SHALL 按新 `coin/interval` 重新拉取快照并重渲染，全程不泄漏订阅与图表实例。选择器 SHALL 提供搜索框按名称过滤，每行 SHALL 展示合约名、24h 涨跌幅与 24h 成交量（取自 `metaAndAssetCtxs`）。

#### Scenario: 切换周期

- **WHEN** 用户从 `1h` 点击 `4h`
- **THEN** 按 ETH/4h 重新拉取快照并展示对应蜡烛

#### Scenario: 切换币种

- **WHEN** 用户在选择器选择 `BTC`
- **THEN** 按 BTC/当前周期拉取快照并更新图表、盘口与统计栏

#### Scenario: 币种列表动态来源

- **WHEN** 页面加载完成
- **THEN** 选择器展示 `meta().universe` 的 perp 合约列表，不出现 `@`/`#` 前缀项

#### Scenario: 搜索过滤

- **WHEN** 用户在选择器输入关键词
- **THEN** 列表按合约名过滤，匹配项高亮展示

#### Scenario: 面板行展示行情

- **WHEN** 选择器展开
- **THEN** 每行显示合约名、24h 涨跌幅与 24h 成交量，涨跌幅正负以颜色标识