---
title: "IP Strategy Web：Vite 7 + TanStack Router 的 Web3 前端重构"
summary: "从 Next.js 迁移到 Vite + TanStack Router 的完整实践：文件式路由自动生成、useRouter→useNavigate 与 lodash→es-toolkit 的迁移经验、多链钱包接入与 TradingView 图表集成。"
date: "2026-09-05"
tags: ["react","vite","web3"]
readMin: 9
---

## 为什么从 Next.js 迁到 Vite

IP Strategy 是一个**纯客户端 DApp**：没有 SEO 需求，没有服务端数据获取，所有状态都来自钱包与链上 RPC。在这种场景下，Next.js 的 SSR 能力不仅用不上，还会带来额外的构建复杂度。

迁移后的技术栈是 **Vite 7 + TanStack Router + Tailwind CSS 4**——更轻、更快、更贴近 SPA 的本质。

## 文件式路由：目录即路由

路由由 `@tanstack/router-plugin` 自动扫描 `src/pages` 生成：

```
tanstackRouter({
  target: 'react',
  routesDirectory: './src/pages',
})
```

每个页面导出一个 `Route` 对象，约定清晰：

```
export const Route = createFileRoute('/home/')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>...</div>;
}
```

动态参数用 `$` 前缀（如 `/user/$id`），以 `-` 开头的目录会被忽略（如 `-components`），非常适合把页面私有组件就近放置。

## 迁移中的三个高频改动

### 1. 路由跳转：useRouter → useNavigate

```
// 迁移前
import { useRouter } from "next/navigation";
const router = useRouter();
router.push('/launch/create');

// 迁移后
import { useNavigate } from "@tanstack/react-router";
const navigate = useNavigate();
navigate({ to: '/launch/create' });
```

### 2. 工具库：lodash → es-toolkit

```
// 迁移前
import { includes, reject } from "lodash";
// 迁移后
import { includes, reject } from "es-toolkit/compat";
```

迁移成本极低，收益是**体积与 Tree-shaking 表现显著更好**（lodash 的 CJS 形态对现代打包器并不友好）。

### 3. 目录约定：page.tsx → index.tsx

App Router 的 `page.tsx` 统一改为 `index.tsx`，与 TanStack Router 的「目录即路由」模型对齐。

## 多链钱包接入

项目同时支持 EVM 与 Solana，两套适配器并存：

-   **EVM**：RainbowKit + wagmi + viem；
-   **Solana**：`@solana/wallet-adapter-*` + Reown AppKit Solana Adapter；
-   **统一入口**：通过 `SelectChainModal` 让用户选择目标链。

## 图表：TradingView Charting Library

K 线使用 TradingView 官方库。由于它不通过 npm 分发，迁移时需额外处理：

```
# 拷贝静态资源到 src（Vite 需要可控的资源路径）
./copy_charting_library_files.sh
```

这一步在 Next.js 下可以靠 `public` 目录兜底，但在 Vite 中必须显式拷贝，否则构建产物会缺文件。

## Tailwind CSS 4 的插件变化

v4 用 Vite 插件替代了 PostCSS 链路：

```
import tailwindcss from '@tailwindcss/vite';
// vite.config.ts
plugins: [tailwindcss(), react(), tsconfigPaths(), nodePolyfills()]
```

> 踩坑提示：升级到 v4 后，IDE 的类名提示需要在每个项目的 `global.css` 中显式引入 Tailwind，不能只依赖全局配置。

## 构建配置的两个关键点

### Node Polyfill

Web3 依赖链大量使用 Node 内置模块（`buffer`、`stream`、`crypto`），必须挂 `vite-plugin-node-polyfills` 才能在浏览器运行。

### 手动分包

```
manualChunks: {
  vendor: ['react', 'react-dom', 'wagmi'],
}
```

把体积大且更新频率低的依赖单独成 chunk，避免业务代码一改就让用户重新下载整个 vendor 包。

## 子路径部署

```
base: '/ipstrategy/',
```

设置 `base` 后，产物可直接部署到域名子路径下，无需额外改写资源引用。

## 复盘

技术选型的第一原则是**匹配场景**。当项目不需要 SSR 时，Vite + TanStack Router 提供的类型安全路由、极快的 HMR 与更简单的构建链路，是比「默认选 Next.js」更理性的答案。
