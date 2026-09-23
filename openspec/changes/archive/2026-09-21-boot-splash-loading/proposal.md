# Proposal

## Why

当前站点只有路由切换的骨架 `app/loading.tsx`，无全站首屏 splash。Web3 主站需要一个炫酷且克制的 Three.js 首屏加载动画（3000 粒子 + 中心光核），并在 `prefers-reduced-motion` 时降级为 CSS pulse，尊重无障碍。

## What Changes

- 新增 `components/boot/ThreeScene.tsx`：纯 three.js 粒子星云 + 中心光核（含 "Leto" 文字），`dynamic import` + `ssr: false`。
- 新增 `components/boot/BootSplash.tsx`：全站首屏覆盖层状态机（hydration 就绪 → hold ≥2s → 淡出卸载），`sessionStorage` 标记避免会话内重复触发；`prefers-reduced-motion` 时降级为 CSS pulse。
- `app/loading.tsx` 保持现有骨架（ArticleCardSkeleton），路由切换**不做** Three.js 动画。
- `app/layout.tsx` 挂载 `<BootSplash />`（`Providers` 内，`Navigate` 前）。
- **Non-goals**：不改主站现有骨架卡片视觉；路由切换不用 Three.js 动画；不用 `@react-three/fiber`；不改全局 CSS 令牌。

## Capabilities

### New Capabilities

- `boot-loading`: 首屏 splash 与路由切换 loading 的加载体验（Three.js 粒子动画、1s 最短展示、sessionStorage 去重、reduced-motion 降级）。

### Modified Capabilities

<!-- 无现有 spec 被修改 -->

## Impact

- 代码：`components/boot/{ThreeScene,BootSplash}.tsx`（新增）、`app/loading.tsx`（改写）、`app/layout.tsx`（挂载 BootSplash）。
- 依赖：新增 `three`（纯 three，不用 R3F）。
- 无障碍：`prefers-reduced-motion` 降级；覆盖层 `aria-busy`。
