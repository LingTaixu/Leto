# Spec Delta

## Purpose

提供基于浏览器钱包的 DataNotary 存证页面，让用户通过钱包签名调用链上 `store(bytes)` 完成存证，并实时查看链上 `Stored` 事件记录。

## ADDED Requirements

### Requirement: 页面可达且提供导航入口

系统 SHALL 提供 `/notary` 路由页面。桌面端主导航与移动端底部导航 SHALL 均包含指向该页面的入口。

#### Scenario: 从桌面导航进入页面

- **WHEN** 用户点击桌面导航中的 `/notary` 入口
- **THEN** 浏览器地址变为 `/notary` 且页面正常渲染

#### Scenario: 从移动端导航进入页面

- **WHEN** 用户在移动端点击底部导航中的 `/notary` 入口
- **THEN** 页面切换至存证页面

### Requirement: 钱包连接

页面 SHALL 提供 RainbowKit 连接按钮，支持注入式浏览器钱包（如 MetaMask）。未连接时页面 SHALL 展示未连接状态，存证写入功能 SHALL 不可用并提示先连接钱包。

#### Scenario: 连接钱包

- **WHEN** 用户点击连接按钮并选择浏览器扩展钱包
- **THEN** 按钮显示已连接地址，存证写入功能变为可用

#### Scenario: 未连接钱包时尝试写入

- **WHEN** 页面未连接任何钱包
- **THEN** 存证区域显示"连接钱包"提示且不提供可提交的表单

### Requirement: 存证写入

已连接钱包且当前网络为 BSC Testnet（chainId 97）时，系统 SHALL 允许用户输入不超过 64 字节的数据并发起 `store(bytes)` 交易。输入为空或超过 64 字节时 SHALL 在链下拒绝并给出错误提示，不发起交易。交易签名后 SHALL 等待回执，并展示交易哈希、成功或失败状态；成功时 SHALL 提供指向区块浏览器的交易链接。

#### Scenario: 成功存证

- **WHEN** 用户输入合法数据（1-64 字节）并提交，钱包完成签名，交易上链成功
- **THEN** 页面展示 txHash 链接、成功状态与存证内容

#### Scenario: 输入为空

- **WHEN** 用户提交空输入
- **THEN** 页面提示"输入不能为空"且不发起交易

#### Scenario: 输入超过 64 字节

- **WHEN** 用户提交超过 64 字节的数据
- **THEN** 页面提示超出长度上限且不发起交易

#### Scenario: 网络不是 BSC Testnet

- **WHEN** 钱包已连接但当前网络不是 chainId 97
- **THEN** 页面提示切换到 BSC Testnet，且不发起交易

#### Scenario: 交易失败

- **WHEN** 用户拒绝签名或交易上链失败
- **THEN** 页面展示失败信息，不展示成功状态

### Requirement: 存证记录展示

页面 SHALL 从链上读取 DataNotary 合约自部署区块起的所有 `Stored` 事件，按区块倒序展示每条记录的数据、时间戳、区块号与 txHash，txHash SHALL 可点击跳转区块浏览器。新产生的 `Stored` 事件 SHALL 实时出现在列表顶部。读取无需连接钱包。

#### Scenario: 初始加载记录

- **WHEN** 用户打开 `/notary` 页面
- **THEN** 页面展示合约自部署以来的存证记录列表（按区块倒序）

#### Scenario: 新存证实时出现

- **WHEN** 合约产生新的 `Stored` 事件
- **THEN** 该记录自动插入列表顶部且无需手动刷新

#### Scenario: 无存证记录

- **WHEN** 合约从未产生 `Stored` 事件
- **THEN** 页面展示"尚无存证记录"的占位提示

#### Scenario: 查看交易详情

- **WHEN** 用户点击某条记录的 txHash
- **THEN** 新标签页打开对应区块浏览器的交易页

### Requirement: 与主站设计系统一致

页面视觉 SHALL 遵循主站设计系统（背景、卡片、按钮、字体、色彩 tokens），并随系统浅色/暗色模式自适应，与现有页面风格一致。

#### Scenario: 浅色模式渲染

- **WHEN** 系统处于浅色模式
- **THEN** 页面使用浅色设计 tokens 渲染，与主站其他页面一致

#### Scenario: 暗色模式渲染

- **WHEN** 系统处于暗色模式
- **THEN** 页面使用暗色设计 tokens 渲染，与主站其他页面一致
