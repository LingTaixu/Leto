# Proposal

## Why

主站需要一个可交互的 Web3 存证 DApp 作为项目展示，将已在 `frontend/`（Vite 参考实现）验证过的 DataNotary 合约调用逻辑移植进 Next.js 主站，统一走主站设计系统。RainbowKit / wagmi / viem 依赖已安装，docs/backend-integration.md 已提供完整合约事实表。

## What Changes

- 新增 `/notary` 路由页面，纯客户端（`"use client"`），展示 DataNotary 合约的存证调用与存证记录。
- 接入 RainbowKit：`lib/rainbowkit.ts` 配置（bscTestnet + RPC + `ssr: false`）+ `app/providers.tsx` 挂载 WagmiProvider / QueryClientProvider / RainbowKitProvider。
- 存证写入卡片：输入 ≤64 字节数据，`store(bytes)` 签名上链，等待回执并展示成功/失败状态与 txHash 链接。
- 存证记录卡片：`getLogs` 全量拉取 + `useWatchContractEvent` 实时插入新记录，展示数据、时间戳、区块号、txHash。
- 桌面端 `Navigate` 与移动端 `TabBar` 各新增一项入口（`/notary`）。
- 样式遵循主站设计系统（Tailwind tokens：`bg-surface`、`border-border`、`text-muted`、accent），不引入 frontend 的霓虹 CSS。

## Capabilities

### New Capabilities

- `notary-page`: 通过钱包连接调用 DataNotary 合约进行链上存证（store）并查看存证记录（Stored 事件）的页面能力。

### Modified Capabilities

<!-- 无现有 spec 被修改 -->

## Impact

- 代码：`app/notary/page.tsx`（新增）、`app/providers.tsx`（新增）、`lib/rainbowkit.ts`（新增）、`components/notary/*`（新增，自 frontend 移植）、`components/Navigate.tsx`、`components/TabBar.tsx`、`app/layout.tsx`（挂 Provider）。
- 依赖：已安装 `@rainbow-me/rainbowkit`、`wagmi`、`viem`、`@tanstack/react-query`，无新增。
- 外部系统：BSC Testnet（chainId 97）DataNotary 合约 `0x3211E60F2D10a200362795C580097A4f9bbc6DdA`，RPC `https://data-seed-prebsc-1-s1.binance.org:8545/`。
