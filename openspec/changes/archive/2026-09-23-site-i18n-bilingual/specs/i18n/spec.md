# Spec Delta

## Purpose

提供站点国际化能力：locale 路由与中间件语言检测、en/zh 消息文件、cookie 切换器，并为更多语言预留接口。

## ADDED Requirements

### Requirement: locale 路由与语言检测

系统 SHALL 以 `[locale]` 动态段承载全站路由（`/zh/…`、`/en/…`）。无 locale 前缀的请求 SHALL 由 middleware 处理：按 `Accept-Language` 检测用户语言并重定向到对应前缀；用户手动选择过语言时（cookie）SHALL 优先于系统语言；无法识别语言时 SHALL 回退到 `zh`。

#### Scenario: 系统语言为英文访问根路径

- **WHEN** 用户浏览器 `Accept-Language` 为英文且未访问过站点
- **THEN** 访问 `/` 被重定向至 `/en/…` 对应路由

#### Scenario: 已手动选择语言

- **WHEN** 用户之前手动切换过语言（cookie 已记录）
- **THEN** 后续访问按 cookie 语言路由，忽略系统语言

#### Scenario: 无法识别语言

- **WHEN** 用户语言不在已支持列表中
- **THEN** 回退至 `/zh/…`

#### Scenario: 资源路径被绕过

- **WHEN** 请求为静态资源（`/_next` 等）
- **THEN** locale 检测不介入该请求

### Requirement: 双语消息层

系统 SHALL 提供 `messages/en.json` 与 `messages/zh.json` 两套 UI 文案，组件通过消息函数按当前 locale 取文案；若某键缺失 SHALL 回退到该 locale 对应文案或 `zh`。

#### Scenario: 英文界面渲染

- **WHEN** 当前 locale 为 `en`
- **THEN** 导航、按钮、提示等 UI 文案显示英文

#### Scenario: 中文界面渲染

- **WHEN** 当前 locale 为 `zh`
- **THEN** 对应 UI 文案显示中文

### Requirement: 语言切换器

系统 SHALL 提供切换器组件，用户可手动切换 `zh`/`en`；切换后 SHALL 写入 cookie 并即时导航到对应 locale 的当前页面。

#### Scenario: 手动切换语言

- **WHEN** 用户在中文界面点击切换为英文
- **THEN** 页面跳转到英文版且 cookie 记录 `en`

### Requirement: 多语言接口预留

语言类型 SHALL 以开放联合定义（`"zh" | "en" | (string & {})`），新增语言 SHALL 仅需增加前缀支持与对应消息文件，不改动核心读取逻辑。

#### Scenario: 未来新增语言

- **WHEN** 需要支持日语
- **THEN** 仅添加 `ja` 前缀支持与 `messages/ja.json`，现有路由与读取代码无需结构性修改