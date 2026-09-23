# Design

## Context

目前站点存在以下问题：
- **焦点环**：Button、Pagination、KlineView、StoreCard 等组件使用 `focus-visible:outline-accent` (黄色)，在米白背景上对比度仅 1.4:1
- **文本颜色**：`text-accent`、`text-success`、`text-error` 在浅色主题下均低于 4.5:1 要求
- **标题风格**：H1-H3 大小不一，设计文档说 Syne 用于标题，但实际实施为 Space Grotesk
- **Prose**：注释承诺 `max-w-[68ch]`，但无实际容器

## Goals / Non-Goals

**Goals:**
- 所有焦点环满足 3:1 可见性要求（黑色）
- 小文本颜色满足 4.5:1，对比度合规
- 标题尺寸达成 1.25x 递减比例，字体角色明确
- Prose 容器宽度限制至阅读友好范围

**Non-Goals:**
- 不改变整体 neubrutalism 视觉风格（硬边框、硬阴影等）
- 不修改 accent 黄色本身 (#FFD23F 作为填充色保留)
- 不处理暗黑模式（项目已为 light-only）

## Decisions

### 决策 1：焦点环颜色从黄改黑

**方案**：`focus-visible:outline-accent` → `focus-visible:outline-[var(--border)]`

**理由**：
- 黄 on 米白 ≈ 1.4:1，WCAG 2.1 要求 3:1
- 黑色对比度 ≥ 7:1，彻底达标
- 不影响 neubrutalism 视觉主义（硬阴影/硬边框本身也是黑）

**备选方案**：
- 双环：外黄内黑 → 复杂且不符合“硬” aesthetic
- 渐变描边 → 增加视觉模糊感

### 决策 2：text-accent 用作背景填充

**方案**：保留 `text-accent` 变量，用作 `bg-accent`，文字使用 `text-on-accent` (黑)

**理由**：
- 黄色是 neubrutalism 核心点缀色
- 文字直接用黄在浅底上不合规，转为背景黄、文字黑
- 代码中已有 `text-accent` 的 15+ 用例，批量替换为 `text-text`/`text-muted`

### 决策 3：Syne 字体用于副标题

**方案**：
- `h1` + 正文标题 → Space Grotesk (`font-heading`)
- `h2-h6` + 副标题 → Syne (`font-display`)

**理由**：
- design.md 指定 Syne→标题，但实际用 Space Grotesk
- Syne 的衬线感更适合副标题装饰，Space Grotesk 现代感更适合主标题
- 中文页面的副标题（如 关于页的二级标题）可用 Syne

### 决策 4：标题尺寸 1.25x 递减

**方案**（尺寸为 spec type-scale-system 的权威数值，由 globals.css `@layer base` 统一控制，页面标题不写显式尺寸类，以支持移动端响应式缩放）：
- `h1`：3rem = 48px / `font-weight: 700`
- `h2`：2rem = 32px / `font-weight: 600`
- `h3`：1.5rem = 24px / `font-weight: 600`
- `h4`：1.25rem = 20px / `font-weight: 500`

**理由**：
- 1.25x 比例清晰，符合设计系统 best practice
- 避免 4xl vs 3xl 等混乱尺寸
- 尺寸集中在 base 层单一事实来源，页面/组件标题自动继承；`@media (max-width: 479.98px)` 按 1.25x 基线缩小（h1 2.5rem / h2 1.75rem / h3 1.25rem）
- 注意：Tailwind 默认 `text-4xl` 为 36px (2.25rem)、`text-2xl` 为 24px (1.5rem)，与 48px/32px 的 rem 数值不对应，故由 base 层直接写 rem 值而非依赖 Tailwind 尺寸类

## Risks / Trade-offs

- **视觉变化**：部分页面标题会变大/变小，发布前需人工校对
- **中文排版**：Syne 无中文字符，副标题中混合中英文需要确认是否出现方框
- **焦点环位置**：黑环在深色按钮上（如 成功按钮）可能不明显 → 考虑 `ring-2 ring-black ring-offset-2` 方案
- **Prose 容器**：68ch 约 48rem，窄屏设备下可能产生水平滚动（需 media query 适配）

## Migration Plan

1. 更新 `app/globals.css` 中的标题尺寸变量
2. 更新 `app/globals.css` `@theme inline` 中的颜色 (success-dark、error-dark)
3. 批量替换组件焦点环：Button、Pagination、not-found、KlineView、StoreCard、BackToTop
4. 替换文本颜色用例：将 `text-accent` 场景改为 `text-text` + `bg-accent`
5. 为 Prose 添加容器宽度约束
6. 回归测试 7 条路由，确保无布局错位

## Open Questions

- Syne 在中文副标题中的表现是否满意？（需实际排版验证）
- 焦点环 `outline-offset` 和 `ring-offset` 哪种更适合 3px 硬边框？