---
title: "Leto 个人站：Agent 驱动的 Next.js 16 博客与链上存证实践"
summary: "从毛坯到精装修：用 Next.js 16 App Router + Tailwind v4 设计令牌搭建个人站，内容层改为 Markdown + frontmatter 驱动，并集成 RainbowKit / wagmi 打造 BSC 链上存证页。"
date: "2026-09-21"
tags: ["nextjs", "web3", "设计"]
readMin: 9
---

## 项目背景与目标

这个个人站的目标很直接：**既是简历与项目复盘的载体，也是一次真实的技术验证**。项目从毛坯起步，由 Agent（DeepSeek V4.1 Flash）协作完成，逐步"精装修"成一套具备设计系统、内容系统与链上交互的完整站点。

需要同时满足三件事：

- **内容驱动**：文章以 Markdown 文件管理，写内容不碰代码；
- **设计一致**：明暗模式自适应，组件共享同一套设计令牌；
- **真实 Web3**：不是摆设——有一个可连接钱包、可发交易的链上存证页。

## 技术栈一览

| 层次 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 16.3 App Router + React 19 | 全站 Server Component 优先 |
| 样式 | Tailwind CSS 4 | 用 `@theme inline` 把 CSS 变量映射为工具类 |
| 语言 | TypeScript 5（strict） | 全量类型约束 |
| 内容 | `gray-matter` + `unified`（remark-gfm） | Markdown → HTML |
| 链上 | RainbowKit 2.2 + wagmi 3.7 + viem 2.x | BSC Testnet 存证 DApp |
| 运行时 | Bun | 安装与脚本 |

## 设计系统：从设计令牌到 Tailwind v4

全站的视觉一致性来自 `globals.css` 里的**两套设计令牌**（浅色 / 暗色），再用 Tailwind v4 的 `@theme inline` 映射成可直接使用的工具类：

```css
:root {
  --bg: #fafafa;
  --surface: #ffffff;
  --text: #18181b;
  --accent: #2563eb;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg: #09090b;
    --surface: #18181b;
    --text: #fafafa;
    --accent: #60a5fa;
  }
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-text: var(--text);
  --color-accent: var(--accent);
}
```

这样一来，组件里只写 `bg-surface`、`text-muted`、`border-border`，**明暗切换由令牌层自动完成**，组件无需感知主题。

视觉上还有两个刻意的细节：

- **Liquid Glass 胶囊**：移动端底部导航用半透明背景 + `backdrop-filter` 模糊 + 顶部高光边，配合滑动指示条实现 iOS 风格的导航；
- **Gemini 流光边框**：文章卡片用 `conic-gradient` 旋转的流光盘作为 1.5px 边框，内层用不透明底盒遮罩，保证"边框在转、文字不糊"。

## 内容层：Markdown 驱动的博客

早期文章正文是内嵌在 TypeScript 里的 HTML 字符串——元数据与正文交织，改一篇要动代码。后来重构为**每篇文章一个 Markdown 文件 + YAML frontmatter**：

```
content/posts/echosync-hyperliquid-exchange.md
---
title: "..."
summary: "..."
date: "2026-03-10"
tags: ["nextjs", "web3"]
readMin: 12
---

## 正文标题
...
```

读取与渲染管线只有一条链路：

```
.md 文件
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
2. **slug 由文件名决定**：`echosync-hyperliquid-exchange.md` → `/blog/echosync-hyperliquid-exchange`，迁移时 URL 保持不变；
3. **排版交给一个组件**：`Prose` 用 Tailwind 的任意后代选择器（`[&_h2]:`、`[&_pre]:`）一次性定义正文层级，Markdown 生成的 HTML 无需逐元素加类。

> 内容系统最重要的不是渲染多花哨，而是**让写文章这件事与代码彻底解耦**。

## 链上存证页：RainbowKit + wagmi

`/web3/notary` 是一个真实可用的存证 DApp：连接浏览器钱包（如 MetaMask），调用 BSC Testnet 上的 `DataNotary` 合约把一段不超过 64 字节的数据写进事件日志。它挂在 `/web3` 功能实验室之下，作为多个链上功能卡片之一。

### Provider 结构

wagmi / RainbowKit 依赖 `window`，必须隔离在客户端。配置单独放一个文件，并显式关闭 SSR：

```ts
export const config = getDefaultConfig({
  appName: "Leto",
  projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID ?? "",
  chains: [bscTestnet],
  transports: {
    [bscTestnet.id]: fallback(RPC_URLS.map((url) => http(url))),
  },
  ssr: false,
});
```

`transports` 里用 viem 的 `fallback` 挂了多个公共 RPC，避免单点被限流；Provider 则按 `WagmiProvider → QueryClientProvider → RainbowKitProvider` 顺序包在根布局里。

### 写入与读取

- **写入**：`useWriteContract` 发 `store(bytes)`，`useWaitForTransactionReceipt` 等回执，成功后展示 txHash 与 BSCScan 链接；空输入、超 64 字节、网络不对都在链下先拦掉。
- **读取**：`usePublicClient().getLogs` 从部署区块拉全量 `Stored` 事件，`useWatchContractEvent` 实时把新记录插到列表顶部——**读取不需要连接钱包**。

### 主题跟随

RainbowKit 的连接按钮自带主题，为了让它在明暗模式下都不突兀，用 `useSyncExternalStore` 订阅 `prefers-color-scheme`，动态在 `darkTheme` / `lightTheme` 间切换，`accentColor` 对齐主站。

## 响应式：两套导航，一套宽度

- **桌面**：顶部 `Navigate` 展示完整文字导航；
- **移动**：底部 Liquid Glass 胶囊 `TabBar`，带滑动指示条，`lg` 以下显示。

内容容器的宽度统一收敛到一处（`max-w-[62.5rem]`），页面、导航、页脚共用，避免各页面宽度参差。

## 工程化与验证

- `bun run lint` + `bunx tsc --noEmit` + `bun run build` 三道关卡；
- 博客走 **SSG**：`generateStaticParams` 遍历 `content/posts/`，构建期产出全部文章静态页；
- 链上页在构建期不触碰 `window`，静态预渲染通过，客户端再 hydrate 钱包状态。

## 复盘

Agent 协作开发这套站点的最大体会是：**架构边界越清晰，Agent 越能稳定产出**。设计令牌、内容契约、Provider 结构这些"接口"定好之后，后续新增页面基本是填空。

另一个感受是**选型要匹配场景**：博客这种以静态内容为主的站点，用 SSG + Markdown 是最省心的组合；而链上交互部分才需要引入 wagmi 这类重客户端依赖，两者在同一套 App Router 下各得其所。
