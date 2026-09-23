# Spec Delta

## Purpose

定义站点的 neubrutalism 视觉主题系统：硬边框、硬阴影、方形布局、纯色配色。该主题替换原有的 Liquid Glass + Gemini 渐变边框风格。

## ADDED Requirements

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