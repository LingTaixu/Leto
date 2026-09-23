# Proposal

## Why

当前站点采用 Liquid Glass + Gemini 渐变边框的「科技感」风格，已过时化。用户希望将页面整体风格改为 neubrutalism——一种以硬边框、硬阴影、方形布局、高对比配色著称的「反精致」设计运动。同时，首屏动画、按钮、卡片等所有界面元素需要统一视觉语言。

**Why now**：neubrutalism 是 2024-2025 年的主流 Web 设计趋势，用户需要一个具备人类手工感、强烈辨识度的品牌形象。

## What Changes

- **BREAKING**：去除暗黑模式，统一使用浅色 neubrutalism 主题
- **BREAKING**：从 Gemini 动态边框过渡到硬边框 + 硬阴影
- **BREAKING**：从 Liquid Glass 玻璃拟态过渡到纯色+硬阴影
- 新增 `components/Marquee.tsx`：跑马灯组件，用于首页展示技能列表
- `app/layout.tsx`：引入 Neubrutalism 推荐的字体（Syne、Space Grotesk、Space Mono）
- `globals.css`：替换为 neubrutalism CSS 变量，删除暗黑模式样式
- 所有组件按 neubrutalism 视觉规范重构：Button、ArticleCard、TabBar、Navigate、Footer、Skeleton、Tag、Pagination、StoreCard、Records、TransferCard、KlineView 控件等
- RainbowKit：保持 lightTheme，仅将 accent 改为黄色 #FFD23F
- ThreeScene 首屏动画：从霓虹风格改造为硬朗的黑白 + 黄点缀风格
- 首页顶部新增跑马灯展示技能列表

## Capabilities

### New Capabilities

- `neubrutalism-theme`: neubrutalism 视觉主题系统（设计 token、颜色、边框、阴影、排版）
- `marquee-component`: 跑马灯组件，用于首页技能展示

### Modified Capabilities

- `boot-loading`: ThreeScene 首屏动画从霓虹风格改造为 neubrutalism 风格

## Impact

- **样式**：全局 CSS 变量替换，所有组件类名保持一致但样式完全改变
- **字体**：`app/layout.tsx` 新增 Google Fonts 引入（Syne、Space Grotesk、Space Mono）
- **依赖**：RainbowKit 保持不变，仅配置 accentColor
- **第三方**：K 线图 TradingView.tsx 保持不变（lightweight-charts 自身渲染），仅其外层控件改造
- **用户体验**：首屏加载动画风格变化，导航栏外观明显不同
- **无障碍**：颜色对比度要确保 4.5:1（neubrutalism 推荐的黄底黑字方案符合要求）