# Proposal

## Why

在之前的 neubrutalism 风格改造（2026-09-23）中，完成了大部分排版和样式的主要改造，但在细节处理上仍存以下问题：

1. **Footer 组件**：当前使用 `bg-black text-white`，与浅色 neubrutalism 主题不匹配。Footer 应改为浅色白底黑字，保持与其它页面的统一视觉风格。

2. **Marquee 组件**：跑马灯使用黑底白字，建议改为浅色主题风格（`bg-surface text-text`）+ 硬边框，这更符合 neubrutalism 的「硬边框」原则。

3. **某些组件的边框宽度**：部分组件使用了 `border-[3px]`，但在细节上可以进一步优化，例如 `Tag` 组件的圆角和阴影效果。

4. **Tab 栏的视觉层次**：Tab 栏的活跃指示条使用了 `rounded-full`，可考虑为更贴合 neubrutalism风格（方形或 rounded-sm）。

5. **全局 CSS 变量的完善**：某些新颜色或阴影变量尚未完全覆盖所有使用场景。

这些调整是为了完成 neubrutalism 风格的「硬边框 + 硬阴影 + 零圆角」原则，确保视觉一致性。

## What Changes

- **BREAKING（视觉）**：`components/Footer.tsx`：从黑底白字改为白底黑字，边框改为硬边框
- **BREAKING（视觉）**：`components/Marquee.tsx`：从黑底白字改为白底黑字 + 硬边框
- **优化**：`components/TabBar.tsx`：活跃指示条从圆形改为方形（rounded-sm）
- **优化**：`components/Tag.tsx`：加入硬阴影效果，悬停时上浮
- **优化**：`app/globals.css`：完善 marquee 样式，添加 footer 样式变量

## Capabilities

### Modified Capabilities

- `footer-component`: 页脚样式从深色主题改为浅色 neubrutalism 风格
- `marquee-component`: 跑马灯样式从深色改为浅色 + 硬边框
- `tab-bar-component`: 活动指示条视觉风格优化
- `tag-component`: 标签 Hover 动画增强

## Impact

- **样式**：Footer 现在与其他页面统一使用浅色主题
- **用户体验**：所有页面在视觉上保持高度一致，无深色/浅色切换的不和谐
- **无障碍**：颜色对比度保持在 4.5:1 或更高
- **构建**：无 TypeScript 错误，构建通过