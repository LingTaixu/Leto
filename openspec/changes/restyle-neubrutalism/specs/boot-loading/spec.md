# Spec Delta

## MODIFIED Requirements

### Requirement: 首屏全屏 splash 覆盖层

站点首次访问时 SHALL 展示全屏 Three.js splash 覆盖层（3000 粒子 + 中心光核含 "Leto" 文字），在页面就绪后至少保持 2 秒，随后淡出并卸载覆盖层。同一浏览器会话内再次访问路由 SHALL NOT 重复触发 splash。

本次变更将 splash 动画风格从「霓虹科技感」改为「neubrutalism 硬朗风格」：
- 背景改为纯黑 `#000000`
- 中心 "Leto" 文字使用 Space Mono 800，黑字加黄描边
- 粒子颜色使用 neubrutalism 配色：`#FFD23F`、`#FF6B6B`、`#74B9FF`
- 阴影从模糊光晕改为硬阴影 `8px 8px 0 0 #000`

#### Scenario: 首次访问展示 splash

- **WHEN** 用户首次打开站点
- **THEN** 全屏 splash 覆盖所有内容，播放硬朗风格的 Three.js 粒子动画并显示 "Leto"

#### Scenario: 最短 2 秒后淡出

- **WHEN** 页面就绪且 splash 已展示
- **THEN** splash 至少持续 2 秒后淡出并卸载

#### Scenario: 同会话不重复触发

- **WHEN** 用户在同一次会话内导航到其他页面再返回首页
- **THEN** splash 不再次出现

### Requirement: 服务端渲染安全

Three.js 组件 SHALL 通过 `dynamic import`（`ssr: false`）在客户端加载，`app/loading.tsx` SHALL NOT 在服务端执行 Three.js 代码，构建 SHALL 通过无 `window is not defined` 错误。

ThreeScene 组件 SHALL 使用 Space Mono 字体渲染 "Leto" 文字。

#### Scenario: 构建通过

- **WHEN** 运行 `bun run build`
- **THEN** 构建成功，无 `window is not defined` 或 hydration 错误