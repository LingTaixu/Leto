# Spec Delta

## Purpose

提供桌面底部常驻任务栏（Dock）：运行中应用列表与状态指示、窗口焦点切换，并集成语言切换、钱包连接入口与时钟，取代原 Header 导航与移动端 TabBar。

## ADDED Requirements

### Requirement: 常驻任务栏

桌面 SHALL 展示底部常驻任务栏（neubrutalism 风格：硬边框 + 硬阴影），包含：应用条目区、语言切换、钱包连接入口、时钟。任务栏 SHALL 始终可见且不被窗口遮挡（窗口可用区域在其上方）。

#### Scenario: 任务栏常驻

- **WHEN** 桌面渲染且有窗口最大化
- **THEN** 任务栏保持可见，窗口不覆盖任务栏区域

### Requirement: 运行中应用条目

任务栏 SHALL 为每个已打开（含最小化）的窗口展示条目（图标 + 名称），并以视觉状态区分：运行中可见 / 最小化 / 焦点。点击条目 SHALL 切换对应窗口：焦点窗口被点击时最小化，否则还原并聚焦。

#### Scenario: 点击最小化窗口条目

- **WHEN** 用户点击任务栏中最小化窗口的条目
- **THEN** 窗口还原并置为焦点

#### Scenario: 点击焦点窗口条目

- **WHEN** 用户点击任务栏中当前焦点窗口的条目
- **THEN** 该窗口最小化

#### Scenario: 状态可辨识

- **WHEN** 多个窗口打开（其一为焦点、其一最小化）
- **THEN** 任务栏条目呈现三种可区分的视觉状态

### Requirement: 语言切换入口

任务栏 SHALL 提供 zh/en 语言切换控件；切换 SHALL 写入 locale cookie 并导航到另一 locale 的桌面入口，尽量保留当前打开的应用（通过深链参数）。

#### Scenario: 桌面切换语言

- **WHEN** 用户在 `/zh` 桌面（打开着博客窗口）切换为 en
- **THEN** 导航到 `/en?app=blog`，桌面为英文且博客窗口重新打开

### Requirement: 钱包连接入口

任务栏 SHALL 提供钱包连接入口（RainbowKit ConnectButton 或等效控件），连接状态 SHALL 对所有窗口内的 Web3 应用共享。

#### Scenario: 任务栏连接钱包

- **WHEN** 用户通过任务栏连接钱包后打开存证窗口
- **THEN** 存证窗口显示已连接状态
