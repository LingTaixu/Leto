# Proposal

## Why

当前站点的排版/可访问性存在多项问题：
- **焦点环对比度不足**：黄色 `outline-accent` 在米白背景上仅 1.4:1，违反 WCAG 2.1 2.4.7 焦点可见性要求
- **文本颜色失败对比**：`text-accent` / `text-success` / `text-error` 均低于小文本 4.5:1 要求
- **标题尺度不一致**：H1-H3 大小、粗细散乱，缺乏系统化

这些问题削弱了站点的可用性，尤其在键盘导航和色觉受损用户场景。

## What Changes

- **字体**：Syne 专用于副标题/标题，其他使用 Space Grotesk；统一 1.25x 递减比例
- **颜色**：黄色仅限背景填充，焦点环、文字颜色改为黑色或合规深色
- **尺寸**：`h1: 3rem`, `h2: 2rem`, `h3: 1.5rem`, `h4: 1.25rem`
- **Prose 容器**：所有段落内容宽度限制至 68ch
- **焦点环**：统一为 `outline-[var(--border)]` (黑)，`focus-visible` 条件下才显现

## Capabilities

### New Capabilities
- `type-scale-system`：定义 neubrutalism 主题下的字体尺寸、粗细、行高体系
- `color-contrast-system`：定义合规的文本颜色、焦点环、交互状态颜色

### Modified Capabilities
- `neubrutalism-theme`：补充焦点环、文本颜色、容器宽度等可访问性约束

## Impact

- Tailwind 颜色类：`text-accent` 场景迁移到 `text-text` + 背景黄化
- 全局样式：更新 `app/globals.css` 中的标题尺寸变量
- 组件更新：Button、Pagination、KlineView、StoreCard 替换焦点环颜色
- 约 15-20 个组件文件受影响