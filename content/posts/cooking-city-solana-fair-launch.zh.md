---
title: "Cooking.City：Solana 公平发射平台的 Next.js 15 全栈实践"
summary: "拆解 Solana 公平发射平台 Cooking.City：Next.js 15 App Router + next-intl 多语言、Reown AppKit 钱包接入、Anchor 程序与 Meteora DLMM 流动性集成，以及防狙击与 Conviction Pool 的工程实现。"
date: "2026-09-12"
tags: ["nextjs","solana","web3"]
readMin: 11
---

## 平台要解决什么问题

Cooking.City 是一个建立在 Solana 上的**公平发射（Fair Launch）平台**。它要对抗的是代币发行中最常见的两类不公：**狙击（Sniper）**与**不公平的筹码分配**。

为此平台引入了两个核心机制：**Conviction Pool**（信念池，提供价格保护）与 **Referral Mechanism**（推荐机制，让分发更均衡）。

## 技术栈

| 维度 | 选型 |
| --- | --- |
| 框架 | Next.js 15.1 App Router + React 19 |
| UI 层 | HeroUI + Tailwind CSS 3.4 |
| 国际化 | next-intl（`[locale]` 动态段） |
| 钱包 | Reown AppKit + Solana Adapter |
| 链上 | @coral-xyz/anchor、SPL Token、Metaplex |
| 流动性 | Meteora DLMM / Dynamic Bonding Curve |
| 行情 | @jup-ag/api、klinecharts、echarts |
| 动效 | framer-motion / motion、lottie-react |

## Provider 分层：上下文不能乱套

根布局里 Provider 的嵌套顺序是经过设计的，`AuthProvider` 依赖钱包状态，而 `PriceProvider` 依赖网络请求上下文：

```
<ContextProvider>
  <HeroUIProvider>
    <ToastProvider />
    <PriceProvider>
      <AuthProvider>{children}</AuthProvider>
    </PriceProvider>
  </HeroUIProvider>
</ContextProvider>
```

> 顺序原则：**被依赖者在外层**。钱包连接在 `ContextProvider`，登录态在 `AuthProvider`——所以 Auth 必须能读到钱包，反之则不行。

## 国际化：App Router 下的 `[locale]`

通过 `next-intl` 插件接管路由，页面组件以 Promise 形式接收 `params`：

```
export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: { locale: string } }>) {
  return <html lang={params.locale} className="dark">{children}</html>;
}
```

注意 `<html lang>` 直接吃 locale，这对 SEO 与无障碍朗读都是必要的。

## 接口代理：rewrites 收口

前端不直连多个后端域名，而是在 `next.config.ts` 里用 rewrites 统一代理，避免 CORS 与密钥外泄：

```
async rewrites() {
  const apiBaseUrl = process.env.API_BASE_URL || "https://api.cooking.city";
  const v2BaseUrl  = process.env.V2_BASE_URL  || "https://dexapi.gemsgun.com";
  return {
    beforeFiles: [
      { source: "/api/:path*",    destination: `${apiBaseUrl}/api/:path*` },
      { source: "/twitter/:path*", destination: `${apiBaseUrl}/twitter/:path*` },
      { source: "/v2/:path*",     destination: `${v2BaseUrl}/v2/:path*` },
    ],
  };
}
```

## 防狙击：双 Config 设计

平台为普通发射与防狙击发射准备了两套链上配置 ID，通过环境变量注入：

```
NEXT_PUBLIC_CONFIG_ID: "ALEKAF3Q48Vp6NV1uFEKSopAfFUpGEixJgEdTEdCcHvx"
NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID: "FQYWAQd6JgLgpbhq1zo4VoCPwLyAwB2uNZqceGPTrvMe"
```

把「策略」做成配置而非代码分支，好处是新增发射模式时无需改动前端逻辑。

## 稳定性与性能取舍

-   **关闭图片优化**（`images.unoptimized = true`）：官方注释写明是为规避内存泄漏，代价是牺牲自动压缩；
-   **生产构建移除 console**：用 Terser 的 `drop_console`，减少线上噪音日志；
-   **外部依赖白名单**：把 `pino-pretty`、`lokijs`、`encoding` 排除出打包，解决 WalletConnect 系依赖在 Node 端的兼容问题；
-   **全局 CORS 头**：在 `headers()` 中统一放开，便于 DApp 嵌入与第三方集成。

## 复盘

Solana 生态的前端复杂度，主要来自**钱包标准碎片化**与**链上程序版本演进**。这个项目的应对方式是把这些都收敛到 `next.config.ts` 与 Provider 层——业务组件只消费 hook，不感知底层差异。
