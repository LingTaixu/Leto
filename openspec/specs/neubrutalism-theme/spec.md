# neubrutalism-theme Specification

## Purpose
定义站点的 neubrutalism 视觉主题系统：硬边框、硬阴影、方形布局、纯色配色。该主题替换原有的 Liquid Glass + Gemini 渐变边框风格。

## Requirements

### Requirement: 纯色底色

站点 SHALL 使用 neubrutalism 推荐的纯色底色：`#FFFDF5`（Off-White）作为浅色主题背景。

#### Scenario: 首页背景为纯白
- **WHEN** 用户访问任意页面
- **THEN** 背景色为 `#FFFDF5`，无玻璃糊效果

### Requirement: 硬边框体系

所有卡片、按钮、输入框 SHALL 使用 `3px solid #000000` 的硬边框。

#### Scenario: 文章卡片边框
- **WHEN** 渲染 ArticleCard 组件
- **THEN** 卡片外层有 `border: 3px solid #000000`，无圆角，无旋转动画

#### Scenario: 按钮边框
- **WHEN** 渲染 Button 组件
- **THEN** 按钮有 `border: 3px solid #000000`，悬停有 `5px 5px 0 0 #000000` 硬阴影

### Requirement: 零圆角

所有组件 SHALL 使用 `border-radius: 0`，没有圆角。

#### Scenario: 输入框无圆角
- **WHEN** 用户聚焦文本输入框
- **THEN** 框架无 `border-radius: 12px` 或 `50%`，始终呈现矩形

### Requirement: 硬阴影深度

所有提升效果 SHALL 使用硬偏移阴影，禁用模糊：
- 小阴影：`3px 3px 0 0 #000`
- 中阴影：`5px 5px 0 0 #000`
- 大阴影：`8px 8px 0 0 #000`

#### Scenario: 按钮点击效果
- **WHEN** 用户点击按钮
- **THEN** 按钮 `translate(3px, 3px)` 后阴影消失，表现为"压下"感

### Requirement: 纯色主题不做暗黑模式切换

站点 SHALL 在所有设备上使用相同的浅色主题，不应响应 `prefers-color-scheme: dark`。

#### Scenario: 暗色设备不切换主题
- **WHEN** 用户在暗色模式设备上访问站点
- **THEN** 界面显示浅色主题，背景为 `#FFFDF5`，文本为 `#000000`

### Requirement: Accent 颜色

站点 SHALL 使用 neubrutalism 推荐的黄色 `#FFD23F` 作为主要点缀色。

#### Scenario: 交互元素使用黄色
- **WHEN** 用户悬停链接或按钮
- **THEN** 背景填充为 `#FFD23F` 黄色，文字为黑色

### Requirement: 焦点环颜色

焦点环 SHALL 使用黑色 `outline-[var(--border)]`，而非黄色 `outline-accent`，满足 3:1 焦点可见性要求。

#### Scenario: 按钮焦点环

- **WHEN** 用户键盘聚焦页面按钮
- **THEN** 3px 黑色 outline 环绕按钮，4px offset

#### Scenario: 卡片焦点环

- **WHEN** 用户键盘聚焦 ArticleCard
- **THEN** 3px 黑色 outline 环绕 article，4px offset（鼠标点击不显现）

### Requirement: 文本颜色合规

所有文本颜色 SHALL 符合 WCAG 2.1 AA 级别。

#### Scenario: 副标题文字

- **WHEN** 渲染 h2 元素
- **THEN** 使用 text-muted (#333333)，不再使用 text-accent 黄色

#### Scenario: 成功消息文本

- **WHEN** 显示成功状态
- **THEN** 使用深绿色 text-success-dark，确保 4.5:1 对比

#### Scenario: 错误消息文本

- **WHEN** 显示错误状态
- **THEN** 使用深红色 text-error-dark，确保 4.5:1 对比

### Requirement: Prose 容器宽度

段落内容容器 SHALL 限制在 `max-w-[68ch]`，提供舒适的阅读行宽。

#### Scenario: 博客文章正文

- **WHEN** 渲染文章正文
- **THEN** Prose 包裹容器宽度 ≤ 68ch
