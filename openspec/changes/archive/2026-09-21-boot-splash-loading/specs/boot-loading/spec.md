# Spec Delta

## Purpose

提供首屏 splash 的加载体验：Three.js 粒子星云动画、最短 2 秒展示、同会话去重、reduced-motion 降级；路由切换沿用现有骨架 loading。

## ADDED Requirements

### Requirement: 首屏全屏 splash 覆盖层

站点首次访问时 SHALL 展示全屏 Three.js splash 覆盖层（3000 粒子 + 中心光核含 "Leto" 文字），在页面就绪后至少保持 2 秒，随后淡出并卸载覆盖层。同一浏览器会话内再次访问路由 SHALL NOT 重复触发 splash。

#### Scenario: 首次访问展示 splash

- **WHEN** 用户首次打开站点
- **THEN** 全屏 splash 覆盖所有内容，播放 Three.js 粒子动画并显示 "Leto"

#### Scenario: 最短 2 秒后淡出

- **WHEN** 页面就绪且 splash 已展示
- **THEN** splash 至少持续 2 秒后淡出并卸载

#### Scenario: 同会话不重复触发

- **WHEN** 用户在同一次会话内导航到其他页面再返回首页
- **THEN** splash 不再次出现

### Requirement: 路由切换保持骨架 loading

路由 segment 切换时 SHALL 沿用现有骨架 loading（`app/loading.tsx` 的 ArticleCardSkeleton），不展示 Three.js 动画。Three.js 仅用于首屏 splash。

#### Scenario: 路由切换展示骨架

- **WHEN** 用户点击导航切换到另一页面
- **THEN** 展示骨架 loading（ArticleCardSkeleton），而非 Three.js 动画

### Requirement: reduced-motion 降级

当用户偏好 `prefers-reduced-motion: reduce` 时，splash SHALL 降级为 CSS pulse 动画（不加载 Three.js），保持加载指示功能。路由切换骨架由主站动画安全策略处理。

#### Scenario: 用户开启减弱动画

- **WHEN** 用户系统设置为 `prefers-reduced-motion: reduce` 且首次打开站点
- **THEN** splash 显示 CSS pulse 动画而非 Three.js 场景

### Requirement: 服务端渲染安全

Three.js 组件 SHALL 通过 `dynamic import`（`ssr: false`）在客户端加载，`app/loading.tsx` SHALL NOT 在服务端执行 Three.js 代码，构建 SHALL 通过无 `window is not defined` 错误。

#### Scenario: 构建通过

- **WHEN** 运行 `bun run build`
- **THEN** 构建成功，无 `window is not defined` 或 hydration 错误

### Requirement: 降级动画不阻碍交互

splash 覆盖层 SHALL 背景不透明（`bg-bg`），淡出后 SHALL 完全卸载不阻碍交互；loading SHALL 覆盖全屏但不阻塞路由替换行为。

#### Scenario: splash 淡出后可交互

- **WHEN** splash 淡出完成
- **THEN** 页面内容可正常点击交互
