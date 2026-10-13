# Spec Delta

## MODIFIED Requirements

### Requirement: 首屏全屏 splash 覆盖层

站点首次访问时 SHALL 展示全屏 splash 覆盖层，在页面就绪后至少保持 2 秒，随后淡出并卸载覆盖层，露出桌面画布（「开机进入桌面」）。同一浏览器会话内刷新 SHALL NOT 重复触发 splash。splash 视觉沿用 neubrutalism 硬朗风格（纯黑背景、黄描边 "Leto"、CSS pulse 动画）。

#### Scenario: 首次访问展示 splash

- **WHEN** 用户首次打开站点
- **THEN** 全屏 splash 覆盖桌面，播放硬朗风格动画并显示 "Leto"

#### Scenario: 最短 2 秒后淡出

- **WHEN** 页面就绪且 splash 已展示
- **THEN** splash 至少持续 2 秒后淡出并卸载，桌面画布（壁纸、图标、任务栏）完整可见且可交互

#### Scenario: 同会话不重复触发

- **WHEN** 用户在同一会话内刷新页面
- **THEN** splash 不再次出现，直接进入桌面

## REMOVED Requirements

### Requirement: 路由切换保持骨架 loading

**Reason**: 站点收缩为单页桌面入口，子路由页面流被移除，路由切换骨架 loading（`app/loading.tsx` 的 ArticleCardSkeleton）不再适用；应用窗口的加载态由窗口内的局部骨架/占位承担。
**Migration**: 删除路由级 loading 骨架依赖；窗口内容加载时在各应用窗口内部展示局部 loading 状态（React.lazy Suspense fallback）。
