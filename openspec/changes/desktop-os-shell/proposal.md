# Proposal

## Why

站点目前是传统的多路由博客布局（Header + 页面流 + TabBar），与「Leto = 一台可开机的电脑」这一品牌隐喻（已有 BootSplash）脱节。将整站改造为桌面操作系统形态，可以把首页、博客、关于、Web3 实验室统一为「桌面应用」，形成独特且连贯的产品体验。

## What Changes

- **BREAKING** 站点从多路由页面流改为**单页桌面应用**：每个 locale 仅保留 `/zh`、`/en` 一个桌面入口，原有子路由（`/blog`、`/blog/[slug]`、`/about`、`/web3/*`）重定向到桌面入口并以查询参数（如 `?app=blog`）唤起对应窗口
- 新增**桌面画布**：壁纸背景 + 桌面图标网格（首页/博客/关于/K线/存证/转账），双击或点击图标启动应用窗口
- 新增**窗口管理器**：应用以 neubrutalism 风格窗口呈现，支持拖拽移动、边缘缩放、最小化/最大化/关闭、z-index 焦点管理、任务栏还原；移动端降级为全屏窗口（不支持拖拽/缩放）
- 新增**任务栏（Dock）**：底部常驻，展示已启动应用、运行/最小化状态指示、点击切换焦点；集成语言切换、钱包连接（RainbowKit）、时钟
- 移除传统布局组件的使用：`Navigate`（Header）、`TabBar`、`BackToTop`、`Footer` 降级或并入任务栏/桌面
- 博客文章列表与详情页改为在「博客窗口」内呈现（窗口内二级视图），文章数据层（markdown/frontmatter/渲染）不变
- BootSplash 保留：开机动画结束后进入桌面（「开机进桌面」隐喻闭环）
- SEO 收缩：sitemap 仅含 `/zh`、`/en` 两个入口；文章级 URL 通过 301 重定向到 `?app=blog&slug=…` 保持可达（内容不再独立可索引，为已接受的取舍）

## Capabilities

### New Capabilities

- `desktop-shell`: 桌面画布、壁纸、桌面图标网格与启动交互、时钟、单页桌面入口与 `?app=` 深链唤起
- `window-manager`: 窗口的打开/关闭/最小化/最大化/还原、拖拽移动、边缘缩放、z-order 焦点管理、移动端全屏降级
- `taskbar`: 底部任务栏/Dock：运行中应用列表与状态指示、焦点切换、语言切换、钱包连接入口

### Modified Capabilities

- `seo`: sitemap 从「全部静态路由 + 文章 URL」收缩为「`/zh`、`/en` 两个桌面入口」；逐页 metadata 收缩为入口页 metadata + 深链重定向；hreflang 仅在入口页输出
- `blog-content`: 「slug 与 URL 稳定」要求变更——文章不再有独立路由，`/<locale>/blog/<slug>` 重定向到桌面入口深链 `/<locale>?app=blog&slug=<slug>`；列表/详情行为迁移到博客窗口内部
- `boot-loading`: splash 结束后的落点从「页面流首屏」改为「桌面画布」；路由切换骨架 loading 要求随子路由移除而废弃

## Impact

- **路由**：删除 `app/[locale]/{blog,about,web3}` 页面路由，新增重定向路由段；`app/[locale]/page.tsx` 改为桌面 shell；`middleware.ts`、`sitemap.ts` 更新
- **组件**：新增 `components/desktop/`（Desktop、DesktopIcon、Window、Taskbar、WindowManager context）；`Navigate.tsx`、`TabBar.tsx`、`BackToTop.tsx`、`Footer.tsx` 移除或改造；现有内容组件（ArticleCard、Prose、kline/*、notary/*）复用为窗口内容
- **状态**：新增客户端窗口状态管理（打开的窗口、几何、z-order），基于 React context + reducer，不引入新依赖
- **i18n**：`messages/{zh,en}/` 新增桌面文案键（desktop.*、window.*、taskbar.*）
- **SEO**：文章不再被独立索引（用户已确认接受）；重定向保证旧链接可达
