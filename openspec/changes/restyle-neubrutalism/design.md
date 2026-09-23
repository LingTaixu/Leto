# Design

## Context

站点当前采用 Liquid Glass + Gemini 渐变边框的「科技感」视觉。项目使用 Tailwind v4 + React 19 + Next.js 16，组件结构清晰，状态管理通过 React Query + Wagmi。首屏动画使用 Three.js 原生渲染。

变更目标：将整个界面从「玻璃质感」过渡到 neubrutalism 风格。

## Goals / Non-Goals

**Goals:**
- 统一 neubrutalism 视觉语言：硬边框、硬阴影、方形布局
- 去除暗黑模式，始终使用浅色主题
- 保留所有功能：K 线图、钱包连接、博客、关于页等
- ThreeScene 动画风格化为硬朗风格

**Non-Goals:**
- 不改变 K 线图 TradingView.tsx 的数据渲染逻辑（lightweight-charts 封装）
- 不影响 Web3 功能（钱包连接、交易、链上数据读取）
- 不添加新特性，只做视觉风格变更
- 不使用额外的 UI 库，直接基于 Tailwind 实现

## Decisions

### 1. CSS Token 重构

**决定**：在 `globals.css` 完全替换现有 CSS 变量。

**方案 A**：增量替换 - 只添加 neubrutalism 变量，保留旧变量
**方案 B**：彻底替换 - 删除旧变量，添加新变量

**选 B 的理由**：两套变量体系会产生冲突，同时移除暗黑模式后，旧变量没有意义。

### 2. 字体策略

**决定**：保留现有字体 + 引入 neubrutalism 推荐字体。

```typescript
// app/layout.tsx
const inter = Inter({ variable: "--font-inter", ... })       // 保留：正文
const jetbrainsMono = JetBrains_Mono({ variable: "--font-jetbrains", ... }) // 保留：代码

const syne = Syne({ variable: "--font-display", weight: "400 800", subsets: ["latin"] }) // 新增：标题
const spaceGrotesk = Space_Grotesk({ variable: "--font-heading", weight: "300 700", subsets: ["latin"] }) // 新增：副标题
const spaceMono = Space_Mono({ variable: "--font-mono", subsets: ["latin"] }) // 替代 JetBrains Mono
```

### 3. RainbowKit 主题

**决定**：使用 `lightTheme` + custom accent。

**方案 A**：用 neubrutalism 自带的 `darkTheme`
**方案 B**：始终用 `lightTheme`，accent 改为 `#FFD23F`

**选 B 的理由**：用户要求「去掉暗黑模式」，且 neubrutalism 自带的暗黑模式是「cyber-brutalism」风格，与浅色 neubrutalism 不匹配。

### 4. ThreeScene 动画风格

**决定**：改造为「硬朗」风格。

**方案**：
- 背景：纯黑 `#000000`
- 文字：Space Mono 800，黑字，黄描边
- 粒子：硬方块感，黄/粉/蓝三色
- 光晕效果：8px 硬阴影替代

关键代码变更点：
```typescript
// createLetoTexture()
ctx.fillStyle = "#000000"  // 纯黑底
ctx.font = "800 96px 'Space Mono', monospace"
ctx.strokeStyle = "#FFD23F"  // 黄描边
ctx.lineWidth = 6

// 粒子颜色
const PARTICLE_COLORS = ["#FFD23F", "#FF6B6B", "#74B9FF"]
```

### 5.跑马灯组件实现

**决定**：使用纯 CSS + React，零依赖。

动画使用 CSS keyframes 实现：
```css
.marquee {
  background: #000;
  color: #fff;
  animation: marquee 40s linear infinite;
  overflow: hidden;
}
.marquee-track { display: inline-flex; }
.marquee-content { gap: 2rem; font-family: var(--font-display); }
.marquee-dot { width: 8px; height: 8px; background: var(--yellow); }
```

## Risks / Trade-offs

- **颜色冲突**：K 线图内部使用红涨绿跌配色（`#ef5350`/`#26a69a`），这与 neubrutalism 的高对比色系不冲突，因为图表本身有自己的色板。
- **字体加载**：新增字体会增加 TTF 文件下载，建议使用 `next/font/google` 的 `preload` 功能。
- **滚动条隐形**：`overflow-x: hidden` 已在原 CSS 中，保持不变。
- **hover 动画**：硬阴影 hover 效果是 neubrutalism 经典特征，保留。

## Migration Plan

1. 更新 `app/layout.tsx`：添加字体引入
2. 重写 `globals.css`：替换 token，删除暗黑模式
3. 创建 `components/Marquee.tsx`：跑马灯组件
4. 更新所有组件样式：
   - Button.tsx → 硬边框 + 硬阴影
   - ArticleCard.tsx → 移除 Gemini 动画
   - TabBar.tsx → 玻璃胶 → 硬边框
   - Navigate.tsx → 边框加粗
   - Footer.tsx → 视觉层次加强
   - 等等
5. 更新 ThreeScene.tsx：改造首屏动画
6. 更新 `app/providers.tsx`：RainbowKit 改为 lightTheme + yellow accent
7. 更新首页：添加跑马灯
8. 测试：检查所有页面、所有组件在 light/dark 浏览器偏好下的显示

## Open Questions

- 跑马灯动画速度（当前 40s）是否适合中文技能词？
- K 线图控件是否需要单独的「硬阴影」主题配置？