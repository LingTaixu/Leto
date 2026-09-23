# Design

## Context

- 现状：`app/loading.tsx` 是骨架卡片（App Router segment loading）；首页 `getPosts()` 本地 fs 同步，SSR 即时；无全站首屏 splash。
- `app/layout.tsx`：`<body>` 内 `<Providers>`（Wagmi/RainbowKit/QueryClient）包裹 Navigate/children/Footer/TabBar。
- 设计令牌（`app/globals.css`）：暗底 `#09090b`、accent `#60a5fa`（暗）/ `#2563eb`（亮）、gemini `#00f2fe/#4facfe/#e94057`、glass tokens。
- Next.js 16.3.5 + React 19，`loading.tsx` 是 SSR HTML，Canvas 不可在服务端执行。
- 依赖：未安装 `three`。

## Goals / Non-Goals

**Goals:**
- 首次访问全屏 splash（3000 粒子 + "Leto" 光核），hold ≥2s 后淡出，`sessionStorage` 会话去重。
- 路由切换保持现有骨架 loading（不做动画）。
- `prefers-reduced-motion` 降级 CSS pulse（不加载 Three.js）。
- 构建期无 SSR 错误（`dynamic` + `ssr: false`）。

**Non-Goals:**
- 不改主站骨架卡片视觉；路由切换不用 Three.js 动画；不引入 `@react-three/fiber`；不改全局 CSS 令牌。

## Decisions

### D1. 纯 three.js，不用 R3F

单场景装饰性动画，`Points` + `ShaderMaterial` + 自管 `requestAnimationFrame`，卸载干净、bundle 更小。R3F 适合交互/多对象，本场景无交互。

### D2. 粒子星云 + 中心光核（取自设计令牌）

```
暗底 (--bg)
  + 3000(splash) 粒子 (Points)
    颜色取 --gemini-1/2/4 (#00f2fe/#4facfe/#e94057)
    缓慢自转 + 呼吸
  + 中心光核 (--accent #60a5fa) 含 "Leto" 文字
    周期扩散光波 (环形 mesh 或 shader)
```

文字用 canvas texture 生成 "Leto"（避免 `TextGeometry` 与字体文件依赖），贴到中心平面。

### D3. `ThreeScene` 组件（当前仅 splash 引用）

```
components/boot/ThreeScene.tsx
  props: { mode: 'splash' | 'loading' }
  - splash: 3000 粒子, 光波更强, 文字更显眼
  - mode:'loading' 保留为扩展参数, 但路由切换不做动画, 当前仅 'splash' 被引用
```

### D4. `BootSplash` 状态机 + sessionStorage 去重

```
mount → waiting(hydration/load) → hold(≥2000ms) → fading(300ms) → done(unmount)

- useEffect: 等 window 'load' + hydration 就绪; 记录 t0, setTimeout 保证 ≥2s
- sessionStorage 'boot-splash-shown' 标记, 已存在则 mount 后直接 done
- prefers-reduced-motion: 不挂 ThreeScene, 显示 CSS pulse 覆盖层, 同样 ≥2s
```

### D5. 路由切换保持骨架 loading

`app/loading.tsx` 保持原骨架（ArticleCardSkeleton），不做 Three.js。App Router 在 segment 就绪时立即替换 loading.tsx 且组件无法延迟，动画时序并不能真正"保 1s"——所以路由切换不做动画，Three.js 只服务首屏 splash（splash 由组件自行卸载，可用计时器保证时长）。

### D6. reduced-motion 降级 CSS pulse

```
matchMedia('(prefers-reduced-motion: reduce)')
- true: 不 import ThreeScene, 只渲染 pulse 圆点/条 (复用现有 animate-pulse tokens)
- false: 正常 Three.js
```

尊重主站已有 motion safety 约定。

## Risks / Trade-offs

- [`three` bundle 体积 ~150kb gzip] → `dynamic` 按需加载，splash 首屏才拉；接受。
- [首屏 splash 被略过（会话去重/加载过快）] → HOLD 设为 2s，保证可视；`sessionStorage` 仅拦截本会话刷新。
- [Canvas 文字在高 DPI 模糊] → canvas texture 按 devicePixelRatio 缩放。
- [hydration 边界] → BootSplash/ThreeScene 全部 `"use client"`，`ssr: false`。

## Migration Plan

纯新增组件 + layout 挂载（loading.tsx 保持骨架），无破坏性改动。回滚：移除挂载与组件。

## Open Questions

无（决策已定：粒子规模、带文字、降级 CSS pulse、路由切换不做动画）。
