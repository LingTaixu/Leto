# Design

## Context

动机见 proposal.md - Why。当前状态与约束：

- Next.js 16 App Router + React 19，`[locale]` 动态路由，middleware 做 locale 检测重定向；站点页面均为静态生成（server components + `generateStaticParams`）
- neubrutalism 设计令牌集中在 `app/globals.css`（`--bg`/`--accent`/`--border`/`--shadow-neu-*`），浅色单主题
- 既有功能组件均为 client components，可整体复用：`components/kline/*`、`components/notary/*`、`ArticleCard`、`Prose`、`Pagination`；文章数据层 `lib/posts.ts` 为 server 端 fs 读取（gray-matter + unified）
- i18n 通过 `I18nProvider`（context）+ `messages/{zh,en}/*.json`，`useI18n().t()` 取文案；RainbowKit/wagmi 已在 `app/providers.tsx` 全局注入
- BootSplash 已实现「开机」隐喻（sessionStorage 去重、CSS pulse），淡出后直接露出后续内容
- 无窗口管理/拖拽相关依赖；项目倾向零新增依赖（图标全部 inline SVG）

## Goals / Non-Goals

**Goals:**

- 桌面 shell 完全由 client 状态驱动窗口（打开/几何/z-order），零新增运行时依赖
- 文章数据仍在 server 端读取：桌面入口页（server component）把 locale 文章列表 + 指定 slug 正文作为 props 传给 client 桌面，避免客户端 fs/API 层
- 旧 URL 全部可达：middleware 级重定向到深链
- 窗口内容组件复用现有组件，不重写业务逻辑

**Non-Goals:**

- 不做窗口内多标签、分屏、窗口分组等高级 WM 特性
- 不做壁纸切换/主题个性化（留待后续 change）
- 不为文章保留独立可索引 HTML（SEO 取舍已在 proposal 确认）
- 不重写 kline/notary 业务组件内部

## Decisions

### D1: 窗口状态用 Context + useReducer，不引状态库

窗口集合、几何、z-order 是纯客户端 UI 状态，规模小（≤7 个应用）。用单个 `WindowManagerProvider`（context + useReducer）足够；引入 zustand/jotai 违背项目零依赖倾向。z-order 用自增计数器（`nextZ`）而非数组重排，reducer 逻辑更简单。

**备选**：每个窗口独立 useState + 提升到 Desktop 组件 —— 状态分散，深链/任务栏联动困难，弃。

### D2: 应用注册表（registry）驱动图标、窗口与深链

单一 `apps.tsx` 注册表：`{ id, iconKey(消息键), Icon(内联SVG), defaultSize, minWidth/minHeight, Content(lazy component) }`。桌面图标网格、任务栏条目、`?app=` 深链解析、窗口渲染全部从注册表派生，避免三处硬编码列表漂移。窗口 Content 用 `React.lazy` + `Suspense`（fallback 为窗口内骨架），保证首屏只加载桌面 shell 代码，kline/lightweight-charts 等重依赖按需加载。

### D3: 深链用 searchParams（`?app=&slug=`），router.replace 同步

窗口打开/关闭时 `router.replace` 更新 `?app=`（聚焦窗口变化时同步；多窗口只记录焦点窗口，URL 是「分享当前焦点」而非完整会话快照 —— 完整会话序列化进 URL 过度设计）。初始加载读取 searchParams 打开对应窗口。关闭全部窗口时清除参数回到纯桌面。

**备选**：hash（`#app=blog`）—— 不与 middleware/generateMetadata 交互，但 Next 对 searchParams 有一等支持（`useSearchParams`），且重定向拼接更直观，选 searchParams。

### D4: 旧路由重定向放在 middleware

`middleware.ts` 已处理 locale 检测；追加规则：`/<locale>/blog/<slug>` → `/<locale>?app=blog&slug=<slug>`；`/<locale>/blog` → `?app=blog`；`/about|/web3|/web3/kline|/web3/notary|/web3/transfer` → 对应 `?app=`。随后删除这些路由段目录。middleware 重定向是 307/308，SEO 信号传递给入口页。

**备选**：每个旧路由保留 `page.tsx` 调 `redirect()` —— 需要保留大量空壳路由段，且静态生成多份 HTML，弃。

### D5: 博客数据 server 端注入，窗口内二级视图 client 状态切换

`app/[locale]/page.tsx`（server）调用 `getPosts(locale)` 与文章渲染（现有 `lib/posts.ts` 管线），把「文章列表元数据 + 全部正文 HTML（或按需 slug→html map）」作为序列化 props 传给 `<Desktop>`。博客窗口内部 list/detail 视图切换是 client 局部状态（+深链 slug 初始视图）。16 篇文章体量小，全量注入可接受；若未来文章数量大增，再演进为按需 server action/route handler 加载正文（本期不做）。

### D6: 拖拽/缩放用 Pointer Events 手写，不引交互库

拖拽移动 + 8 向缩放是经典 pointerdown/move/up + setPointerCapture 模式，约 150 行 hook（`useWindowDrag`/`useWindowResize`）。引 react-rnd/react-draggable 增加依赖且 neubrutalism 定制样式反而受限。触摸设备（`coarse` pointer）直接走移动端全屏分支，不挂拖拽监听。

### D7: 移动端全屏降级用 CSS + 同一窗口组件

不为移动端另写组件树：`Window` 组件在 `lg` 以下（或 `(pointer: coarse)`）渲染为 `fixed inset-0` 全屏、隐藏拖拽/缩放手柄，一次只显示焦点窗口（其余 `hidden`）。判断用 CSS media query 为主 + `matchMedia("(pointer: coarse)")` 辅助（决定 pointer 监听是否挂载），避免 hydration 不一致：初始 render 统一按桌面几何输出，挂载后 effect 内切换。

### D8: BootSplash 保留原样，桌面作为其淡出后的落点

splash 逻辑不变（session 去重、2s hold、300ms fade）；只是布局中其兄弟节点从页面流换成 `<Desktop>`。无 spec 外的代码改动。

### D9: 移除组件的处置

`Navigate.tsx`、`TabBar.tsx`、`Footer.tsx`、`BackToTop.tsx`、`Marquee.tsx`（跑马灯技能条并入桌面壁纸装饰或关于窗口，实现时定）、`Breadcrumbs.tsx`、`app/loading.tsx`：删除文件。`LocaleSwitch` 改造进任务栏。`ArticleCard`/`Pagination`/`Prose`/`Tag` 复用于博客窗口。

## Risks / Trade-offs

- [文章全量 HTML 注入使入口页 JS/HTML 变大] → 16 篇体量可控；`React.lazy` 保证博客窗口代码按需加载；后续可切 server action 按需取正文
- [SEO 收缩：文章失去独立索引] → 用户已确认；旧 URL 308 重定向保留可达性与权重传递
- [拖拽/缩放与窗口内交互（图表十字线、文本选择）事件冲突] → 拖拽仅绑定标题栏、缩放仅绑定边缘手柄；窗口内容区 `touch-action: auto` 不受影响；lightweight-charts 在可缩放容器内已有 ResizeObserver 自适应（现有 KlineView 行为）
- [hydration 风险：桌面几何/移动端判定依赖 window] → 所有几何状态初始值确定（默认 cascade 布局），pointer/matchMedia 判定放在 mount 后 effect
- [深链 router.replace 频繁触发 Next 导航] → replace 同路由仅改 searchParams，成本为 shallow 级；仅在焦点窗口变化时写入，拖拽过程不写 URL
- [wagmi/RainbowKit 弹层与窗口 z-order 冲突] → 窗口 z-index 起点低于 RainbowKit modal（其 z-index 在 2^31 量级由库管理），任务栏 z 低于窗口，桌面壁纸最低

## Migration Plan

1. 先落地桌面 shell 与窗口管理器（新功能，不破坏旧路由）；桌面入口页暂时并存
2. 切换 `app/[locale]/page.tsx` 为桌面；middleware 加重定向；删除旧路由段与废弃组件
3. 更新 sitemap/robots/metadata、messages 文案键、README 路由表
4. 回滚策略：单 PR 分支开发，回滚即 revert；middleware 重定向规则独立成函数便于单独摘除

## Open Questions

- 桌面图标是否需要「首页/关于我」信息卡片窗口作为开机默认打开的欢迎窗口（首次访问自动打开一个 Welcome 窗口）？—— 不影响架构，实现时按体验微调
- Marquee 技能跑马灯放壁纸装饰还是关于窗口内？—— 纯视觉决定，实现时定
