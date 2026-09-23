# Tasks

## 1. 钱包与 Provider 接入

- [x] 1.1 新建 `lib/rainbowkit.ts`：`getDefaultConfig`（appName `Leto`、projectId 空串、chains `[bscTestnet]`、transports 使用 docs §0 的 RPC 及 fallback、`ssr: false`），并导出 `config`；验证 `bunx tsc --noEmit` 无类型错误
- [x] 1.2 新建 `app/providers.tsx`（`"use client"`）：`WagmiProvider` → `QueryClientProvider` → `RainbowKitProvider`，主题用 `useSyncExternalStore` + `matchMedia('(prefers-color-scheme: dark)')` 在 `darkTheme`/`lightTheme` 间切换且 `accentColor` 对齐主站 accent；验证文件存在且 lint 通过
- [x] 1.3 在 `app/layout.tsx` 的 `<body>` 内包裹 `<Providers>`；验证 `bun run dev` 下 `/` 等现有页面无 hydration/`window` 报错

## 2. 合约常量

- [x] 2.1 新建 `components/notary/contract.ts`：从 `frontend/src/contract.ts` 移植 `CONTRACT_ADDRESS`、`DEPLOY_BLOCK`、`EVENT_TOPIC0`、`MAX_DATA_LENGTH`、`abi`，并逐一与 `docs/backend-integration.md` §2 核对；验证 `bunx tsc --noEmit` 通过

## 3. 存证写入卡片

- [x] 3.1 新建 `components/notary/StoreCard.tsx`（`"use client"`）：移植 frontend 的 `useWriteContract` + `useWaitForTransactionReceipt` 逻辑，链下校验空输入/超 64 字节，`useChainId() !== 97` 时提示切换，成功显示 txHash 链接（BSCScan testnet）、失败显示错误；验证 `bunx tsc --noEmit` 通过
- [x] 3.2 StoreCard 样式改用主站 tokens（`bg-surface/50`、`border-border/70`、`Button` 组件、`font-mono` 输入框），移除 frontend 霓虹 class；验证页面在未连接/连接/错误三种状态下样式正确

## 4. 存证记录卡片

- [x] 4.1 新建 `components/notary/Records.tsx`（`"use client"`）：`usePublicClient().getLogs`（`fromBlock: DEPLOY_BLOCK`）初始加载 + `useWatchContractEvent` 实时插入，按 txHash 去重、按区块倒序，解码 `bytes` 数据；验证 `bunx tsc --noEmit` 通过
- [x] 4.2 Records 表格改用主站 tokens 渲染（数据、时间戳、区块、txHash 链接），空态显示"尚无存证记录"；验证初始加载与实时新记录插入均正常

## 5. 页面与导航

- [x] 5.1 新建 `app/notary/page.tsx`（`"use client"`）：主站布局容器 + 标题区 + 合约地址 pill + `<ConnectButton showBalance />` + StoreCard + Records 两栏布局；验证 `/notary` 在 dev 下渲染
- [x] 5.2 在 `components/Navigate.tsx` 的 `LINKS` 加入 `{ href: "/notary", label: "Notary" }`；验证桌面导航出现入口且点击可达
- [x] 5.3 在 `components/TabBar.tsx` 的 `TABS` 加入 `/notary` 项（含图标，注意滑动指示条宽度 `calc((100% - 1rem) / 4)` 需同步更新）；验证移动端底部导航出现入口且激活态正确

## 6. 构建与验证

- [x] 6.1 运行 `bun run lint` 无错误
- [x] 6.2 运行 `bun run build` 成功，确认 SSR 下无 `window is not defined`、无 hydration 错误
- [x] 6.3 手动端到端验证：`bun run dev` 打开 `/notary`，连接 MetaMask（BSC Testnet），存证一条 ≤64 字节数据，确认回执成功且新记录实时出现在列表顶部
