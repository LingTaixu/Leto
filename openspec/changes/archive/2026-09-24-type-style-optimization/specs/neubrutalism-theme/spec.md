# Spec Delta

## MODIFIED Requirements

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