---
title: "Leto 个人站：Agent 驱动的 Next.js 16 双语博客与 Web3 功能实验室"
summary: "从毛坯到精装修：用 Next.js 16 App Router + Tailwind v4 设计令牌搭建 Neubrutalism 风格的 zh/en 双语个人站，内容层 Markdown + frontmatter 驱动，并集成 RainbowKit / wagmi 与 Hyperliquid K 线打造 BSC 链上存证、转账与实时行情功能实验室。"
date: "2026-09-24"
tags: ["nextjs", "web3", "设计"]
readMin: 12
---

## 项目背景与目标

这个个人站的目标很直接：**既是简历与项目复盘的载体，也是一次真实的技术验证**。项目从毛坯起步，由 Agent（DeepSeek V4.1 Flash）协作完成，逐步"精装修"成一套具备设计系统、内容系统、国际化与链上交互的完整站点。

需要同时满足四件事：

- **内容驱动**：文章以 Markdown 文件管理，写内容不碰代码；
- **双语**：`zh` / `en` 双版本路由，按访问者语言自动分发；
- **设计一致**：全站共享一套 Neubrutalism 设计令牌；
- **真实 Web3**：不是摆设——有一个可连接钱包、可发交易、可看实时行情的功能实验室。

## 技术栈一览

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 16.3 App Router + React 19 | 全站 Server Component 优先 |
| 样式 | Tailwind CSS 4 | `@theme inline` 把 CSS 变量映射为工具类 |
| 语言 | TypeScript 5（strict） | 全量类型约束；target ES2020（BigInt 字面量） |
| 国际化 | 自研 i18n（`[locale]` 路由 + middleware） | `zh` / `en` 消息文件 |
| 内容 | `gray-matter` + `unified`（remark-gfm） | Markdown → HTML，双语分文件 |
| 链上 | RainbowKit 2.2 + wagmi 3.7 + viem 2.x | BSC Testnet 存证与转账 DApp |
| 行情 | `@nktkas/hyperliquid` + `lightweight-charts` | Hyperliquid K 线（REST 快照 + WSS 实时） |
| 动效 | Three.js | 首屏 splash 粒子动画 |
| 埋点 | `@vercel/analytics` v2 | Web Analytics |
| 运行时 | Bun | 安装与脚本 |

## 设计系统：Neubrutalism 设计令牌

全站视觉一致性来自 `globals.css` 里的**一套浅色设计令牌**，再用 Tailwind v4 的 `@theme inline` 映射成可直接使用的工具类。风格定为 Neubrutalism：**硬边框、硬阴影、零圆角、纯色搭配**，不响应 `prefers-color-scheme`（单一浅色主题）。

```css
:root {
  --bg: #fffdf5;          /* Off-White 底色 */
  --surface: #ffffff;     /* 卡片 / 面板 */
  --border: #000000;      /* 结构黑 */
  --text: #000000;        /* 正文 */
  --text-muted: #333333;  /* 次级文字（AA 4.5:1） */
  --accent: #ffd23f;      /* Bold Yellow，只做背景填充 */
  --on-accent: #000000;   /* 黄底黑字 */
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-border: var(--border);
  --color-text: var(--text);
  --color-accent: var(--accent);
  --shadow-neu-sm: 3px 3px 0 0 #000;
  --shadow-neu: 5px 5px 0 0 #000;
  --shadow-neu-lg: 8px 8px 0 0 #000;
}
```

组件里只写 `bg-surface`、`text-muted`、`border-border`、`shadow-neu`，**明暗只是素材、主题由令牌层透传**。字体分四档：Inter（正文）、JetBrains Mono（代码）、Space Grotesk（h1 / heading）、Syne（h2 及以下 / display），标题按 1.25x 递减（h1 3rem / h2 2rem / h3 1.5rem / h4 1.25rem），小屏（<480px）再等比缩小。

可访问性也是设计系统的一部分：

- **焦点环**：键盘聚焦一律黑色 `outline-[var(--border)]` + 4px offset，鼠标点击不显现；
- **对比度**：正文、muted（#333）、成功深绿 `#1b5e20`、错误深红 `#b71c1c` 均满足 WCAG 2.1 AA；黄色绝不当文字色。

三个有辨识度的视觉细节：

- **首页跑马灯**：黑底白字 + 黄色方点分隔的技能条，CSS 驱动 25s 无缝循环，悬停暂停；
- **首屏 splash**：Three.js 粒子星云 + 中心 "Leto" 字样，页面就绪后至少展示 2 秒淡出，同会话不重复；`prefers-reduced-motion` 时降级为 CSS pulse；
- **硬阴影交互**：按钮悬停位移 + 硬阴影，按下 `translate(3px,3px)` 阴影消失，形成"压下去"的触感。

## 国际化：locale 路由 + 中间件 + 消息层

全站路由以 `[locale]` 动态段承载（`/zh/…`、`/en/…`），三层协作：

1. **`middleware.ts`**：无 locale 前缀的请求按 `Accept-Language` 检测语言并 302 重定向；用户手动选择过时 cookie 优先；无法识别回退 `zh`；静态资源（`/_next` 等）不介入；
2. **消息层**：`messages/zh/*.json` 与 `messages/en/*.json` 按命名空间拆分（`home`、`blog`、`web3`、`notary`、`transfer`、`kline`…），`resolveMessage` 按当前 locale 取文案，缺失键回退 `zh`；
3. **切换器**：`LocaleSwitch` 写 cookie 并通过 `useI18n` 将 `pathname` 首段替换导航，切语言不丢路由状态。

语言类型用开放联合定义（`"zh" | "en" | (string & {})`），新增语言只需加前缀与消息文件，不改核心逻辑。

## 内容层：Markdown 驱动的双语博客

早期文章正文是内嵌在 TypeScript 里的 HTML 字符串——元数据与正文交织，改一篇要动代码。后来重构为**每篇每种语言各一个 Markdown 文件**：`{slug}.{locale}.md`，frontmatter 里的 `title`、`summary` 为对应语言文案：

```
content/posts/echosync-hyperliquid-exchange.zh.md
content/posts/echosync-hyperliquid-exchange.en.md
---
title: "…"
summary: "…"
date: "2026-03-10"
tags: ["nextjs", "web3"]
readMin: 12
---

## 正文标题
…
```

读取与渲染管线只有一条链路：

```
{slug}.{locale}.md
  │ gray-matter            → { data: frontmatter, content: markdown }
  │ unified()
  │   .use(remark-parse)
  │   .use(remark-gfm)     → GFM 表格 / 删除线 / 任务列表
  │   .use(remark-rehype)
  │   .use(rehype-stringify)
  ▼
HTML 字符串 → <Prose> 组件
```

几个关键设计：

1. **frontmatter 契约 + fail-fast**：`title`、`summary`、`date`、`tags` 必填，缺失时直接抛错并指明文件与字段，绝不让不完整文章静默上线；
2. **slug 由文件名决定**：`echosync-hyperliquid-exchange.zh.md` → `/zh/blog/echosync-hyperliquid-exchange`，URL 跨语言稳定；
3. **排版交给一个组件**：`Prose` 用 Tailwind 的任意后代选择器（`[&_h2]:`、`[&_pre]:`）一次性定义正文层级，Markdown 生成的 HTML 无需逐元素加类；
4. **SSG 双维度**：`generateStaticParams` 遍历 `locale × slug`，构建期产出全部双语静态页。

> 内容系统最重要的不是渲染多花哨，而是**让写文章这件事与代码彻底解耦**。

## Web3 功能实验室：/web3

`/web3` 是一个"功能实验室"首页：三张 Neubrutalism 卡片（badge + 标题 + 描述），各自指向一个独立实验。feature 清单由 `features.ts` 驱动，sitemap 自动覆盖。

### 数据存证（DataNotary）

连接浏览器钱包（如 MetaMask），调用 BSC Testnet（chainId 97）上的 `DataNotary` 合约，把一段不超过 64 字节的数据写进事件日志，哈希即证据。读取侧从部署区块拉全量 `Stored` 事件并按区块倒序展示，`useWatchContractEvent` 实时插到列表顶部——**读取不需要连接钱包**。

### 原生币转账（BSC Transfer）

双卡片布局：**余额查询**可输入任意地址（或一键用当前钱包）查 BSC Testnet BNB 余额；**转账**连接钱包后校验地址 / 金额 / 余额与网络（chainId 97），`useSendTransaction` 发出、等 1 确认回执，展示 txHash 与 BSCScan 链接。空输入、非法地址、余额不足都在链下先拦掉。

### K 线图表（Hyperliquid Real-time）

`/web3/kline` 是纯浏览器端行情实验，双通道数据流：

- **REST 快照**：`InfoClient.candleSnapshot` 拉近 30 天 K 线（默认 `ETH`/`1h`），币种列表来自 `allMids` 的 perp 币种；
- **WSS 实时**：`SubscriptionClient.candle({coin, interval})` 订阅当前周期，事件按 `s`/`i` 校验归属、丢弃旧订阅迟到消息，切换即 `unsubscribe`，整个页面只复用一条连接；
- **渲染**：`lightweight-charts` 蜡烛主窗格 + 成交量副窗格 + 十字线 OHLC 图例；快照用 `setData`、实时单根用 `series.update` 直通图表，**数据变化不重建图表**，缩放位置不丢；
- **历史懒加载**：滚到历史边缘按最早根向前拉一批并前插渲染，时间戳去重、保持严格升序，到达最老边界提示"已到最早数据"，并发锁防重复；
- **URL 状态唯一源**：`coin`/`interval` 同步到 `?coin=&interval=`，刷新与分享不丢状态。

## 响应式：两套导航，一套宽度

- **桌面**：顶部 `Navigate` 完整文字导航 + 语言切换器，`md` 以上显示；
- **移动**：底部 Neubrutalism 胶囊 `TabBar`，黄色滑动指示条跟随激活 tab，`lg` 以下显示。

内容容器的宽度统一收敛（`max-w-[62.5rem]`），K 线页放宽至 `max-w-[90rem]`，页面、导航、页脚共用，避免参差。

## 埋点与分析：Vercel Web Analytics

根布局引入 `@vercel/analytics/next` 的 `<Analytics />` 组件（v2 包），开启 Vercel Dashboard 的 Web Analytics 后自动上报页面浏览，部署后即可在 Analytics 面板查看；v2 无需额外配置，组件统一放在 `<body>` 内即可。

## SEO：sitemap / robots / hreflang

- `app/sitemap.ts`：覆盖全部静态路由（`zh`、`en` 两 locale 全量）与全部文章 URL；
- `app/robots.ts`：允许全量抓取并回指 sitemap；
- 逐页 `generateMetadata`：每页提供 `title` / `description`，根 layout 提供 `metadataBase`、`openGraph`、`twitter`；
- `localeAlternates`：输出当前页 `canonical` 与 `zh` / `en` / `x-default` 的 `hreflang` alternates，绝对 URL 以 `NEXT_PUBLIC_SITE_URL` 为准。

## 工程化与验证

- `bun run lint` + `bunx tsc --noEmit` + `bun run build` 三道关卡；
- 博客走 **SSG**：`generateStaticParams`（locale × slug）双维度，构建期产出全部静态页；
- 链上页与 K 线页在构建期不触碰 `window`：客户端组件声明 `"use client"`，Three.js 用 `dynamic(…, { ssr: false })`，静态预渲染通过，客户端再 hydrate 钱包状态与图表。

## 复盘

Agent 协作开发这套站点的最大体会是：**架构边界越清晰，Agent 越能稳定产出**。设计令牌、frontmatter 契约、i18n 消息键、Provider 结构这些"接口"定好之后，后续新增页面基本是填空。

另一个感受是**选型要匹配场景**：博客这种以静态内容为主的站点，用 SSG + Markdown 是最省心的组合；链上交互才需要引入 wagmi 这类重客户端依赖；而实时行情则证明「REST 快照打底 + WSS 增量」在浏览器端直连也能做到不重建图表、不丢缩放位置——三者在同一套 App Router 下各得其所。