# Spec Delta

## Purpose

提供桌面操作系统形态的站点外壳：桌面画布与壁纸、桌面图标网格与应用启动交互、时钟，以及单页桌面入口与 `?app=` 深链唤起能力，取代原多路由页面流布局。

## ADDED Requirements

### Requirement: 单页桌面入口

每个 locale SHALL 仅提供 `/<locale>` 一个桌面入口页面；入口页 SHALL 渲染完整桌面（壁纸 + 图标 + 任务栏），原多路由页面流布局（Header 导航、页面滚动流、TabBar）SHALL 被移除。

#### Scenario: 访问桌面入口

- **WHEN** 用户访问 `/zh` 或 `/en`
- **THEN** 渲染桌面画布：壁纸背景、桌面图标网格、底部任务栏，无传统 Header/TabBar

#### Scenario: 旧子路由重定向

- **WHEN** 用户访问旧路由（如 `/zh/blog`、`/zh/about`、`/zh/web3/kline`）
- **THEN** 重定向到对应桌面入口深链（如 `/zh?app=blog`），并自动打开对应应用窗口

### Requirement: 桌面图标与应用启动

桌面画布 SHALL 展示应用图标网格，至少包含：博客、关于、K 线、存证、转账；每个图标 SHALL 有名称与 neubrutalism 风格图形。点击（桌面端单击或双击其一，移动端单击）图标 SHALL 启动或聚焦对应应用窗口。

#### Scenario: 图标启动应用

- **WHEN** 用户点击桌面上的「博客」图标
- **THEN** 打开博客应用窗口并置于最前

#### Scenario: 重复启动聚焦已有窗口

- **WHEN** 应用窗口已打开（含最小化）且用户再次点击其桌面图标
- **THEN** 不新建窗口，而是还原/聚焦既有窗口

#### Scenario: 移动端启动

- **WHEN** 用户在移动端视口点击桌面图标
- **THEN** 应用以全屏窗口形式打开

### Requirement: 深链唤起应用

桌面入口 SHALL 支持查询参数深链（`?app=<id>`，博客文章追加 `&slug=<slug>`）：加载时自动打开对应应用窗口；未知 app id SHALL 被忽略且桌面正常渲染。

#### Scenario: 深链打开应用

- **WHEN** 用户访问 `/zh?app=kline`
- **THEN** 桌面加载后 K 线应用窗口自动打开

#### Scenario: 深链打开指定文章

- **WHEN** 用户访问 `/zh?app=blog&slug=some-post`
- **THEN** 博客窗口打开并直接展示该 slug 的文章详情

#### Scenario: 未知深链

- **WHEN** 用户访问 `/zh?app=unknown`
- **THEN** 桌面正常渲染，不打开任何窗口，无报错

### Requirement: 桌面时钟

任务栏或桌面 SHALL 展示本地时间时钟，按当前 locale 格式化，随时间自动更新。

#### Scenario: 时钟走动

- **WHEN** 桌面已渲染
- **THEN** 时钟显示当前本地时间且每分钟（或更短间隔）刷新

### Requirement: 壁纸与桌面美学

桌面背景 SHALL 使用 neubrutalism 设计令牌（`--bg`/`--accent`/`--border` 等）构成壁纸（纯色/几何图案），窗口与图标 SHALL 遵循硬边框 + 硬阴影规范，与现有主题一致。

#### Scenario: 桌面视觉一致

- **WHEN** 桌面渲染完成
- **THEN** 壁纸、图标、窗口均使用项目设计令牌，无与 neubrutalism 主题冲突的圆角/模糊阴影
