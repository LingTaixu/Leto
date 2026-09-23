# type-scale-system Specification

## Purpose

定义站点 neubrutalism 主题下统一的字体尺寸、字号、行高体系，解决标题排版不一致、字体角色模糊、阅读体验差的问题。

## Requirements

### Requirement: 标准化标题尺寸比例

站点 SHALL 使用 1.25x 递减比例的标题尺寸系统：

- `h1`：`font-size: 3rem` (48px)，`font-weight: 700` (bold)
- `h2`：`font-size: 2rem` (32px)，`font-weight: 600` (semibold)
- `h3`：`font-size: 1.5rem` (24px)，`font-weight: 600` (semibold)
- `h4`：`font-size: 1.25rem` (20px)，`font-weight: 500` (medium)

#### Scenario: 首页主标题 H1 采用最大尺寸

- **WHEN** 用户访问首页
- **THEN** 主标题渲染为 3rem/48px 且为 bold（由 globals.css 标题基座提供）

#### Scenario: 章节标题 H2 采用次大尺寸

- **WHEN** 渲染章节标题
- **THEN** 渲染为 2rem/32px 且为 semibold（由 globals.css 标题基座提供）

### Requirement: Syne 字体用于副标题/标题

站点 SHALL 将 Syne 字体专用于副标题（h2 及以下）和装饰性标题，正文标题（h1）和正文使用 Space Grotesk。

#### Scenario: 副标题使用 Syne 字体

- **WHEN** 渲染二级标题
- **THEN** 使用 `font-display` 字体族（Syne），加宽 `font-weight: 600`

#### Scenario: 一级标题使用 Space Grotesk

- **WHEN** 渲染页面主标题
- **THEN** 使用 `font-heading` 字体族（Space Grotesk），加粗 `font-weight: 700`

### Requirement: 统一标题行高与间距

标题 SHALL 使用统一的行高 1.15，字母间距 -0.02em，外间距 `mb-4`，内间距 `tracking-tight`。

#### Scenario: 标题块级间距统一

- **WHEN** 渲染任意标题元素
- **THEN** 下方留白 1rem (mb-4)，避免视觉拥挤

### Requirement: 响应式标题缩放

站点 SHALL 在移动端自动缩放标题尺寸，min-width 480px 时保持比例：

- `h1`：3rem → 2.5rem
- `h2`：2rem → 1.75rem
- `h3`：1.5rem → 1.25rem

#### Scenario: 小屏幕标题适配

- **WHEN** 用户在手机上访问站点
- **THEN** 标题尺寸按比例缩小，保持层级清晰