# Design

## Context

- 主站为 Next.js 16 App Router + Tailwind v4 设计 tokens（`bg-surface`、`border-border`、`text-muted`、accent 蓝），现有页面 `/`、`/about`、`/blog`、`/tags` 均遵循该设计系统。
- `frontend/` 内有已跑通的 Vite 参考实现（DataNotary）：`wagmi.ts`、`contract.ts`、`StoreCard.tsx`、`Records.tsx`，业务逻辑可直接移植，但其 `index.css` 是暗色霓虹风格，**不采用**。
- `docs/backend-integration.md` 是合约事实表的权威来源：地址 `0x3211E60F...6DdA`、chainId 97、RPC、`store(bytes)` ≤64B、`Stored(uint256 indexed, bytes)`、deploy block `132286769`、错误字符串。
- 依赖已安装：`@rainbow-me/rainbowkit` 2.2.11、`wagmi` 3.7.7、`viem` 2.x、`@tanstack/react-query` 5.x。无 WalletConnect projectId（注入式钱包 MetaMask 等可用）。

## Goals / Non-Goals

**Goals:**
- 新增 `/notary` 客户端页面，可在浏览器钱包（如 MetaMask，BSC Testnet）连接下调用 `store()` 存证并实时查看 `Stored` 事件记录。
- 完全复用主站设计系统，视觉与现有页面一致（浅色/暗色自适应）。
- 桌面 `Navigate` 与移动 `TabBar` 均提供入口。

**Non-Goals:**
- 不做链下数据库/索引（记录直接来自链上 `eth_getLogs`）。
- 不支持写入路径的后端私钥方案；仅浏览器钱包签名。
- 不引入 WalletConnect 云钱包（无 projectId），仅注入式钱包；`getDefaultConfig` 的 projectId 传空串。
- 不修改合约、不引入新依赖。

## Decisions

### D1. Provider 结构：独立 config + client wrapper，挂到根 layout

```
lib/rainbowkit.ts      export const config = getDefaultConfig({...bscTestnet, ssr: false})
app/providers.tsx      "use client": WagmiProvider(config) > QueryClientProvider > RainbowKitProvider(theme)
app/layout.tsx         在 <body> 内包 <Providers>{children}</Providers>
```

- 理由：RainbowKit/Wagmi 依赖 `window`，必须隔离在客户端。config 放独立文件便于 SSR 期引用常量而不执行浏览器 API。
- 备选：Provider 只包在 `app/notary/page.tsx`——更局部但布局层无法访问 hook，且页面级包法在 RSC 边界更易出错；全局包更符合 RainbowKit 官方 Next.js 示例。

### D2. 页面为单一路由 + 两个卡片组件

- `app/notary/page.tsx`：`"use client"`，页面主体（标题区 + 合约 pill + `<ConnectButton showBalance>` + StoreCard + Records）。
- `components/notary/StoreCard.tsx`、`components/notary/Records.tsx`：逻辑自 `frontend/src/components/` 移植，仅把 class 换成主站 tokens。
- 理由：与参考实现一一对应，改动面小、可对照验证。

### D3. 合约常量集中放 `components/notary/contract.ts`

- 从 `frontend/src/contract.ts` 复制 `CONTRACT_ADDRESS`、`DEPLOY_BLOCK`、`EVENT_TOPIC0`、`MAX_DATA_LENGTH`、`abi`（`store` + `Stored`），与 docs 文档核对一致。
- 理由：单一事实来源；后续若主站其他页面也需要，再提升到 `lib/`。

### D4. 记录读取与实时更新

- 初始：`usePublicClient().getLogs({ address, event: Stored, fromBlock: DEPLOY_BLOCK, toBlock: 'latest' })`，按区块号倒序，按 txHash 去重。
- 实时：`useWatchContractEvent({ eventName: 'Stored', onLogs })` 将新记录插入顶部。
- 未连接时记录仍可展示（读取无需钱包）；写入区展示"连接钱包"占位。
- 理由：与参考实现一致，事件日志即权威数据源。

### D5. RainbowKit 主题跟随主站明暗模式

- 用 `useSyncExternalStore`（或小 hook + `matchMedia('(prefers-color-scheme: dark)')`）动态返回 `darkTheme`/`lightTheme`，`accentColor` 对齐主站 accent（浅色 `#2563eb`、暗色 `#60a5fa`）。
- 理由：主站设计系统随系统明暗切换，ConnectButton 应保持一致，避免割裂。
- 备选：固定 `darkTheme`——实现最简单，但浅色系统下突兀，否决。

### D6. SSR/hydration 保护

- config `ssr: false`；所有 wagmi hook 均位于 `"use client"` 组件；Records 初始拉取放 `useEffect`，首屏显示 loading 态。
- 理由：避免 `window is not defined` 与 hydration mismatch。

## Risks / Trade-offs

- [公共 BSC Testnet RPC 可能限流/不稳定] → config 的 `transports` 配置多个 fallback RPC（docs §0 提供 3 个 URL），必要时记录区显示错误并允许重试。
- [RainbowKit 主题与主站 tokens 存在色差] → 仅微调 accentColor，接受 ConnectButton 自带样式与页面 tokens 的轻微差异。
- [`useWatchContractEvent` 轮询频率与公共 RPC 冲突] → 保持 wagmi 默认轮询间隔，不做自定义高频轮询。
- [钱包未切换至 BSC Testnet 时调用失败] → 写入前校验 `useChainId() === 97`，提示切换，与参考实现一致。
- [交易卡在 pending] → 展示等待态，链接 BSCScan 供用户自行追踪，不做 replace-by-fee（客户端钱包控制）。

## Migration Plan

- 纯新增页面与 Provider，无路由/数据结构破坏；`/notary` 404 在部署后自动消除。
- 回滚：删除 `/notary` 路由、Provider 包裹与导航项即可。

## Open Questions

无（需求与关键决策已对齐）。
