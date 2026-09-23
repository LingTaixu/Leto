# Spec Delta

## Purpose

在 web3 功能实验室提供 Hyperliquid K 线图表：拉取 ETH 1 小时 K 线数据并以 lightweight-charts 蜡烛图渲染，明暗主题适配主站设计令牌。

## ADDED Requirements

### Requirement: 币种与周期切换

系统 SHALL 提供币种与周期切换器：周期档位至少含 `1m/5m/15m/1h/4h/1d`；币种列表 SHALL 动态取自 `allMids`（perp 币种），切换后 SHALL 按新 `coin/interval` 重新拉取快照并重渲染，全程不泄漏订阅与图表实例。

#### Scenario: 切换周期

- **WHEN** 用户从 `1h` 点击 `4h`
- **THEN** 按 ETH/4h 重新拉取快照并展示对应蜡烛

#### Scenario: 切换币种

- **WHEN** 用户在币种选择器选择 `BTC`
- **THEN** 按 BTC/当前周期拉取快照并更新图表与币种标签

#### Scenario: 币种列表动态来源

- **WHEN** 页面加载完成
- **THEN** 币种选择器展示来自 `allMids` 的 perp 币种列表

### Requirement: URL 状态保留

当前 `coin` 与 `interval` SHALL 同步到 URL 查询参数（`?coin=&interval=`）；带参数访问 SHALL 恢复所选状态；刷新与分享后状态不丢失。默认值（无参数时）SHALL 为 `ETH` / `1h`。

#### Scenario: 切换后 URL 更新

- **WHEN** 用户切换到 `BTC` / `4h`
- **THEN** URL 变为 `?coin=BTC&interval=4h`，页面状态一致

#### Scenario: 带参访问恢复状态

- **WHEN** 用户打开分享链接 `/web3/kline?coin=SOL&interval=15m`
- **THEN** 页面初始即为 SOL / 15m 并拉取对应数据

#### Scenario: 刷新与分享不丢失

- **WHEN** 用户刷新或复制当前 URL 到新标签
- **THEN** 币种与周期与刷新前一致

### Requirement: WSS 实时蜡烛

系统 SHALL 在浏览器直连 Hyperliquid WSS（`WebSocketTransport` + `SubscriptionClient.candle({coin, interval})`）接收实时蜡烛；单根更新 SHALL 按 upsert 合并（`t` 相同替换最后一根，跨时间插入新根）；事件 SHALL 按 `s`（币种）与 `i`（周期）校验归属，丢弃旧订阅的迟到消息；切换或卸载 SHALL `unsubscribe()`，不泄漏连接（依赖 SDK 断线重连与自动重订阅）。接入前 SHALL 完成浏览器直连 spike 验证；spike 失败时本需求标记阻塞并暂停。

#### Scenario: 实时更新当前蜡烛

- **WHEN** WSS 推送当前周期蜡烛的最新 o/h/l/c
- **THEN** 图表最后一根蜡烛原地更新，不产生重复根、不重建图表

#### Scenario: 跨时间新增蜡烛

- **WHEN** 新周期开始、WSS 推送新 `t` 的蜡烛
- **THEN** 图表追加新蜡烛

#### Scenario: 过滤旧订阅消息

- **WHEN** 切换币种瞬间收到旧订阅的 `s=ETH` 事件（当前为 BTC）
- **THEN** 该事件被丢弃，图表数据不被污染

#### Scenario: 切换与卸载退订

- **WHEN** 用户切换币种或离开页面
- **THEN** 旧订阅被 unsubscribe，连接不泄漏

#### Scenario: 浏览器直连验证（spike）

- **WHEN** 阶段二开始
- **THEN** 先用最小代码验证浏览器可建立 wss://api.hyperliquid.xyz/ws 连收 candle 消息；失败则记录阻塞并暂停本需求

### Requirement: 历史数据懒加载

用户滚到历史边缘时系统 SHALL 请求更早一批 K 线（`candleSnapshot` 以最早根为 `endTime` 向前取一窗口）并前插渲染；前插 SHALL 平移可见逻辑范围以保持用户视点不跳（不触发展开额外 React 渲染）；到达最老边界或已无更多数据时 SHALL 停止加载并提示"已到最早数据"。

#### Scenario: 滚动到历史边缘触发加载

- **WHEN** 用户向左滚动使可见 `from` 低于阈值
- **THEN** 请求更早一批数据，前插渲染且视点保持不跳

#### Scenario: 最老边界停止

- **WHEN** 已加载到合约首根且再向前请求返回空
- **THEN** 停止加载并显示"已到最早数据"

#### Scenario: 加载中不重复请求

- **WHEN** 上一批加载仍在进行或已达边界
- **THEN** 不发起重复请求（并发锁）

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

系统 SHALL 使用 lightweight-charts 渲染蜡烛图，初始 SHALL 通过 `timeScale().setVisibleLogicalRange` 指定可见范围（显示最近 100 根 + 右侧 3 根留白），可通过滚动/缩放回看更早数据；蜡烛颜色 SHALL 为红涨绿跌（`#ef5350` / `#26a69a`）；图表 SHALL 支持默认滚动与缩放交互。图表实例 SHALL 与数据解耦：历史快照用 `series.setData`，实时单根用 `series.update`，主题变化用 `chart.applyOptions`，SHALL NOT 因数据/主题变化销毁重建图表（容器卸载除外）。

#### Scenario: 渲染蜡烛图

- **WHEN** 数据就绪
- **THEN** 图表显示蜡烛（涨跌色），初始可见最近 100 根且右侧留白，可滚动查看更早数据

#### Scenario: 支持滚动与缩放

- **WHEN** 用户在图表上拖拽或滚轮操作
- **THEN** 图表平移与缩放正常响应

#### Scenario: 数据更新不重建图表

- **WHEN** 快照刷新、实时更新或主题切换发生
- **THEN** 已有图表实例保持，仅更新 series 数据或 layout 选项，缩放位置不丢失