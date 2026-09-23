# Design

## Context

虽然之前的 neubrutalism 改造已经完成大部分工作，但在细节上仍存在一些问题：

- Footer 使用了黑底白字，这与浅色 neubrutalism 主题不匹配
- Marquee 跑马灯同样使用深色主题
- 某些组件的视觉细节（圆角、阴影）可以进一步优化

这些不一致会影响用户体验，营造出「深色/浅色混合」的误感。

## Goals / Non-Goals

**Goals:**
- 统一所有组件在浅色 neubrutalism 主题下的视觉表现
- 完善硬边框 + 硬阴影的视觉规范
- 优化 hover / active 动画效果

**Non-Goals:**
- 不添加新组件
- 不修改功能逻辑
- 不改变颜色主体（黄色 #FFD23F 作为 accent）

## Decisions

### 1. Footer 样式改造

**决定**：将 Footer 从深色主题改为浅色主题。

**理由**：
- neubrutalism 建议使用浅色主题（黄底黑字是 accent 的应用场景）
- 保持与其他页面的一致性
- 用户体验更连贯

**变更**：
```tsx
// Footer.tsx
// 旧：bg-black text-white
// 新：bg-surface text-text border-t-[4px] border-border
```

### 2. Marquee 样式改造

**决定**：将跑马灯从深色改为浅色 + 硬边框。

**变更**：
```css
/* globals.css */
.marquee {
  /* 旧：background: #000000; color: #ffffff; */
  /* 新： */
  background: var(--surface);
  color: var(--text);
  border-bottom: 4px solid var(--border);
}
.marquee-content {
  /* 保持但可以微调 */
  background: linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.05) 50%, transparent 50%);
}
```

### 3. TabBar 指示条风格

**决定**：将活跃指示条从圆形改为方形（rounded-sm）。

**理由**：
- neubrutalism 强调「硬」的感觉
- 方形更贴合硬边框 aesthetic

## Risks / Trade-offs

- Footer 改为浅色后，GitHub/RSS 链接的黄色高亮会更突出，这是期望的效果
- Marquee 的滚动速度可能需要微调（25s 调整为 30s 更适合中文技能词）

## Migration Plan

1. 运行 `npm run build` 验证当前构建状态
2. 更新 `components/Footer.tsx`：更换为浅色主题
3. 更新 `components/Marquee.tsx`：改为浅色 + 硬边框
4. 更新 `globals.css`：完善 marquee 样式
5. 更新 `components/TabBar.tsx`：指示条圆角调整
6. 本地测试：检查首页、页脚、跑马灯效果
7. 构建验证：`npm run build` 无错误