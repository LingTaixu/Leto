# Tasks

## 1. 桌面 shell 基础（window-manager + desktop-shell）

- [x] 1.1 创建 `components/desktop/apps.tsx` 应用注册表（id、消息键、内联 SVG 图标、defaultSize/min 尺寸、lazy Content），注册 blog/about/kline/notary/transfer 五个应用，内容组件复用现有 `ArticleCard`/`Prose`/`kline/*`/`notary/*`/transfer 组件；验证：`bun run build` 通过且注册表类型完整
- [x] 1.2 创建 `components/desktop/WindowManager.tsx`（context + useReducer：open/close/minimize/maximize/restore/focus、几何存储、自增 z 计数）；验证：桌面页临时挂 2 个测试窗口，open/focus/minimize 状态切换正确
- [x] 1.3 创建 `components/desktop/Window.tsx` 窗口组件：neubrutalism 标题栏（图标+标题+最小化/最大化/关闭按钮）、内容区 Suspense fallback 骨架、焦点/非焦点视觉区分；验证：窗口按钮触发对应 reducer 动作，焦点窗口标题栏呈强调色
- [x] 1.4 实现 `useWindowDrag` / `useWindowResize` hooks（Pointer Events + setPointerCapture，标题栏拖拽、边缘/角 8 向缩放、最小尺寸与桌面边界约束）；验证：桌面端拖拽/缩放流畅且窗口不被拖出可用区域
- [x] 1.5 创建 `components/desktop/Desktop.tsx` 桌面画布：neubrutalism 壁纸（设计令牌纯色/几何图案）、图标网格（从注册表派生，点击启动/聚焦）、窗口层、点击空白不关闭窗口；验证：点击图标开窗、重复点击聚焦既有窗口
- [x] 1.6 移动端降级：`lg` 以下或 `(pointer: coarse)` 时窗口 `fixed inset-0` 全屏、隐藏拖拽/缩放手柄、仅显示焦点窗口；判定逻辑放 mount 后 effect 避免 hydration 不一致；验证：移动端视口打开应用为全屏、切换应用时前窗最小化
- [x] 1.7 实现深链：初始加载读 `?app=&slug=` 开窗（未知 id 忽略）、焦点窗口变化时 `router.replace` 同步、全部关闭时清参数；验证：直接访问 `/zh?app=kline` 与 `/zh?app=blog&slug=<真实slug>` 正确开窗，`?app=unknown` 桌面正常

## 2. 任务栏（taskbar）

- [x] 2.1 创建 `components/desktop/Taskbar.tsx`：底部常驻硬边框条，运行窗口条目（图标+名称+三态：焦点/运行/最小化），点击条目切换（焦点窗点击→最小化，否则还原聚焦）；验证：多窗口场景下三态可辨识、点击行为符合规格
- [x] 2.2 任务栏集成时钟（本地时间、locale 格式化、定时刷新）与 `LocaleSwitch` 改造（切换语言保留当前焦点应用：跳 `/<next>?app=<id>`）；验证：时钟走动，`/zh` 打开博客窗口切 en 后落 `/en?app=blog` 且窗口重开
- [x] 2.3 任务栏集成 RainbowKit ConnectButton；验证：任务栏连接钱包后 notary/transfer 窗口内显示已连接状态
- [x] 2.4 层级校准：壁纸 < 窗口 < 任务栏 < RainbowKit modal；窗口最大化不遮挡任务栏；验证：最大化窗口与钱包弹层叠放正确

## 3. 路由切换与数据注入

- [x] 3.1 改造 `app/[locale]/page.tsx`：server 端读取 `getPosts(locale)` 与文章正文 HTML（现有 `lib/posts.ts` 管线），序列化 props 注入 `<Desktop>`；更新 generateMetadata 为桌面入口文案；验证：桌面首屏可见图标，博客窗口列表按日期倒序展示当前 locale 文章
- [x] 3.2 博客窗口内部二级视图：列表（复用 ArticleCard/Pagination）↔ 详情（复用 Prose），深链 `slug` 初始进详情、详情返回保持分页位置；验证：窗口内点进文章、返回列表行为符合 blog-content delta 场景
- [x] 3.3 `middleware.ts` 追加旧路由重定向：`/<locale>/blog[/<slug>]`、`/<locale>/about`、`/<locale>/web3[/kline|/notary|/transfer]` → `/<locale>?app=…[&slug=…]`，保留原 locale 检测逻辑；验证：curl 旧路径返回 3xx 且 Location 为对应深链
- [x] 3.4 删除旧路由段（`app/[locale]/blog`、`about`、`web3`）与废弃组件（`Navigate`、`TabBar`、`Footer`、`BackToTop`、`Breadcrumbs`、`app/loading.tsx`；`Marquee` 按 design D9 处置），清理死引用；验证：`bun run build` 通过，无残留 import
- [x] 3.5 关于窗口内容：复用原 about 页内容组件化；验证：关于窗口正常展示原页面内容

## 4. SEO / i18n / 收尾

- [x] 4.1 `app/sitemap.ts` 收缩为 `/zh`、`/en` 两条目；robots 不变；入口页 hreflang/canonical 保留、删除子路由 alternates 引用；验证：`/sitemap.xml` 仅两条目，head 含正确 hreflang
- [x] 4.2 `messages/{zh,en}/` 新增 `desktop.*`、`window.*`、`taskbar.*` 文案键（应用名、窗口控件 aria-label、任务栏 aria-label 等），删除失效键；验证：zh/en 桌面无缺失键告警（resolveMessage 回退不触发）
- [x] 4.3 更新 `openspec/specs` 同步前自查：`openspec validate desktop-os-shell` 通过；更新 README 路由表与技术栈描述；验证：validate 输出 0 错误
- [x] 4.4 整体验证：`bun run lint && bun run build`；手动过一遍核心流：首次访问 splash→桌面→开博客读文章→开 K 线切币种→连钱包存证→最小化/还原/最大化→切语言→旧 URL 重定向；验证：全流程无 console 错误
