# Tasks

## 1. 依赖与场景组件

- [x] 1.1 安装 `three`（含类型），验证 `package.json` dependencies 已记录且 `bunx tsc --noEmit` 无类型错误
- [x] 1.2 新建 `components/boot/ThreeScene.tsx`（`"use client"`）：纯 three.js 粒子星云 + 中心光核（canvas texture 文字 "Leto"），`mode: 'splash' | 'loading'` 控制粒子数（3000 / 1500）与动画时长（约 1s 循环），自管 RAF 与卸载清理，颜色取设计令牌；验证 `bunx tsc --noEmit` 通过
- [x] 1.3 ThreeScene 支持 `prefers-reduced-motion` 判断（matchMedia），或在调用方跳过；验证逻辑可被降级路径复用

## 2. 首屏 splash

- [x] 2.1 新建 `components/boot/BootSplash.tsx`（`"use client"`）：状态机 waiting→hold(≥1000ms)→fading(300ms)→done，`sessionStorage` 标记同会话去重，`dynamic` 引入 `ThreeScene({ mode: 'splash' })` + `ssr: false`；验证未就绪/已展示/淡出三态
- [x] 2.2 BootSplash 降级：`prefers-reduced-motion: reduce` 时不加载 ThreeScene，渲染 CSS pulse 覆盖层并同样 hold ≥1s；验证降级路径生效
- [x] 2.3 在 `app/layout.tsx` 的 `<Providers>` 内、`<Navigate />` 前挂载 `<BootSplash />`；验证 `bun run dev` 首次访问展示 splash

## 3. 路由切换 loading（保持骨架，不做动画）

- [x] 3.1 `app/loading.tsx` 还原为现有骨架（ArticleCardSkeleton），不引入 Three.js 动画；验证文件已还原且 `aria-busy` 保留
- [x] 3.2 路由切换不做动画（Three.js 仅服务首屏 splash），无需 reduced-motion 降级
- [x] 3.3 验证路由切换展示骨架正常（非粒子动画）

## 4. 构建与验证

- [x] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 4.2 运行 `bun run build` 成功，确认无 `window is not defined`、无 hydration 错误
- [x] 4.3 手动验证：`bun run dev` 首次访问展示 3000 粒子 splash 且 hold ≥2s 淡出；同会话刷新不重复 splash；路由切换展示骨架（非动画）；系统开启 reduced-motion 后降级 CSS pulse
