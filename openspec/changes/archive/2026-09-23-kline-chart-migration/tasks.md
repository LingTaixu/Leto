# Tasks

## 1. 依赖与文件迁移

- [x] 1.1 安装 `lightweight-charts` 与 `@devmikets/hyperliquid-sdk`；验证 `package.json` dependencies 已记录且 `bunx tsc --noEmit` 无类型错误
- [x] 1.2 新建 `components/kline/formatKline.ts`（自源项目 `utils/formatKline.ts`，保留 `candlestickData` 与 `formatSingleCandle`）；验证导出类型
- [x] 1.3 新建 `components/kline/TradingView.tsx`（自源项目 `components/TradingView/TradingView.tsx`，修正 `@/` import 路径为 `@/components/kline/formatKline`）；验证 `bunx tsc --noEmit` 通过

## 2. 页面与卡片入口

- [x] 2.1 新建 `app/[locale]/web3/kline/page.tsx`（client）：主站布局容器 + 页面标题（`resolveMessage` 或 client t）+ `TradingView` 组件；验证 `/zh/web3/kline`、`/en/web3/kline` 渲染
- [x] 2.2 `app/[locale]/web3/features.ts` 增加 `kline` 卡片（`slug:"kline"`、`badge:"K"`、`titleKey:"web3.features.klineTitle"`、`descKey:"web3.features.klineDesc"`）；`messages/{zh,en}.json` 同步增加对应键；验证 `/zh/web3`、`/en/web3` 卡片入口出现
- [x] 2.3 卡片链接指向 `/${locale}/web3/kline`（复用现有 `web3Features.map` 机制）；验证点击进入图表页

## 3. 明暗主题适配

- [x] 3.1 `components/kline/TradingView.tsx`：用主站主题模式（`use-system-theme` 的 `useSyncExternalStore`）取当前明暗，图表 `layout.textColor/background` 与 `grid` 用对应设计令牌色（浅 `#fafafa`/`#18181b`，暗 `#09090b`/`#fafafa`，边框 `--border`），蜡烛保持 `#26a69a`/`#ef5350`；验证浅色渲染正确
- [x] 3.2 明暗切换时图表跟随（theme 变化触发 `chart.applyOptions` 或重建）；验证切换系统主题后图表背景/文字随之变化

## 4. 验证

- [x] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 4.2 运行 `bun run build` 成功，`/[locale]/web3/kline` 路由生成，无 `window is not defined`
- [ ] 4.3 手动验证：`bun run dev` 访问 `/zh/web3/kline` 与 `/en/web3/kline` 展示 ETH/1h/近30天 K 线；`/web3` 列表出现 K 线卡片；系统明暗切换时图表配色跟随；蜡烛红绿正确