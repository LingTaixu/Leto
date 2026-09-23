# Spec Delta

## Purpose

定义满足 WCAG 2.1 AA 级别的文本颜色、焦点指示、交互状态颜色，解决黄色文字对比度失败、焦点环低可见性等可访问性问题。

## ADDED Requirements

### Requirement: 焦点环颜色合规

所有可聚焦元素的焦点环 SHALL 使用黑色 `outline-[var(--border)]` (阈值对比 7:1 이상)，并在 `focus-visible` 条件下才显现，避免鼠标点击误触。

#### Scenario: 按钮焦点环为黑色

- **WHEN** 用户通过键盘 Tab 键聚焦按钮
- **THEN** 3px 黑色 `outline-[var(--border)]` + 4px offset 显示焦点指示

#### Scenario: 输入框焦点环为黑色

- **WHEN** 用户点击或键盘聚焦文本输入框
- **THEN** 3px 黑色 `outline-[var(--border)]` + 2px offset 显示焦点

### Requirement: 文本颜色对比度合规

所有文本颜色 SHALL 满足 WCAG 2.1 AA 级别：

- 大文本 (18pt+, 加粗)：对比度 ≥ 3:1
- 小文本：对比度 ≥ 4.5:1

#### Scenario: 副标题文本颜色

- **WHEN** 渲染 h2 副标题
- **THEN** 使用 `text-muted` (灰黑 #333333) on off-white (#FFFDF5)，对比度 ≥ 4.5:1

#### Scenario: 成功状态文本

- **WHEN** 显示成功状态消息
- **THEN** 使用深绿 `#1b5e20` (success-dark) on #FFFDF5，满足 4.5:1

#### Scenario: 错误状态文本

- **WHEN** 显示错误消息
- **THEN** 使用深红 `#b71c1c` (error-dark) on #FFFDF5，满足 4.5:1

### Requirement: 黄色仅用于背景填充

`text-accent` (黄色 #FFD23F) SHALL 仅用于背景填充，绝不用于文字颜色。

#### Scenario: 链接悬停使用黄色背景

- **WHEN** 用户悬停页面链接
- **THEN** 背景填满黄色 #FFD23F，文字显示黑色 text-on-accent

#### Scenario: 标记徽章使用黄色背景

- **WHEN** 渲染技术标签徽章
- **THEN** bg-accent + text-on-accent，黄底黑字

### Requirement: Prose 容器宽度限制

所有段落样式内容 SHALL 限制在 68ch 以内，提高中文长句阅读舒适度。

#### Scenario: 博客文章段落宽度

- **WHEN** 渲染博客文章正文
- **THEN** 外层容器 `max-w-[68ch]` (48rem)，居中排列