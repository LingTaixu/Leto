# Design

## Context

- 现状 `components/kline/`：`TradingView.tsx` 将 fetch（硬编码 ETH/1h/30天）与 chart 渲染耦合；`[kLineData, theme]` 变化即 `chart.remove()+createChart()` 全量重建——实时流下不可用（闪烁/丢缩放）。依赖 `@devmikets/hyperliquid-sdk`（HTTP 快照可用，未用 WS）。
- 资料已验证：
  - 官方 SDK **`@nktkas/hyperliquid`**（GitHub nktkas/hyperliquid）：`HttpTransport`/`InfoClient`/`SubscriptionClient`/`WebSocketTransport` 同名导出，`bun add @nktkas/hyperliquid`，Bun 1.3.3+ 支持；与现包 API 同构，替换摩擦低。
  - WS 文档（hyperliquid.gitbook .../websocket/subscriptions）：`candle` 订阅 `{type:"candle", coin, interval}`，interval 14 档；`Candle{t,T,s,i,o,h,l,c,v,n}`；unsubscribe 协议；**`allMids` → `mids: Record<string,string>` 即全平台币种源**；确认 `SubscriptionClient.candle` 与 `WebSocketTransport`（默认 `wss://api.hyperliquid.xyz/ws`、断线重连 + `resubscribe:true`、`isTestnet` 开关）。
- 与 leto 集成：kline 页为 `[locale]/web3/kline`（server wrapper + client `KlineView`）；主站设计令牌主题已有；i18n 文案走 messages（zh/en 同构）。
- Hyperliquid 数据为主网只读行情（本页无交易），与站内 BSC testnet 功能并存无冲突。

## Goals / Non-Goals

**Goals:**
- 阶段一：SDK 替换、数据/渲染解耦（增量）、币种+周期切换、`?coin=&interval=` URL 状态。
- 阶段二：WSS candle 实时（spike 前置）、upsert 合并、订阅不泄漏。
- 全程 bun 安装；i18n 双语文案；构建/主题行为不回退。

**Non-Goals:**
- 不做下单/交易、深度图、成交量副图、历史分页、ticker 行情条、币种搜索（原生 select 可滚动即可）、测试网行情（isTestnet 不启用）。

## Decisions

### D1. SDK 替换（阶段一第一个任务）

`bun remove @devmikets/hyperliquid-sdk && bun add @nktkas/hyperliquid`；import 语句全量替换（`components/kline/*` 与 `formatKline.ts` 的类型 import）。`candleSnapshot`/`InfoClient`/`CandleSnapshotResponse` 同构，tsc 验证类型兼容；若有命名漂移以 tsc 与包类型为准逐点修正。

### D2. 数据/渲染解耦：useKline + 增量渲染

```
useKline(coin, interval)          TradingView.tsx (纯渲染)
  state: candles / loading /       chart 建一次(容器存在时)
         error / coinList            ├ 历史: series.setData(candles)
  effects:                           ├ 实时: series.update(one)   [阶段二]
    coin/interval 变 → 快照重拉      ├ 主题: chart.applyOptions    (不再 remove)
    unmount → 清理                   └ 卸载容器时才 remove()
  阶段二: ws candle 订阅+退订        props: candles + theme
```

chart 生命周期由容器与组件卸载决定，数据/主题只走 set/update/applyOptions——满足 spec 新增场景"数据更新不重建图表"（缩放位置不丢）。

### D3. upsert 合并与消息归属校验

单根合并规则：以 `t/1000`（秒）为键，等于已存在最后一根（或已知集合的相同 t）→ 替换 o/h/l/c/v；更大 → 追加；乱序旧 t → 更新对应根（Map 索引）。同时过滤 `e.s !== coin || e.i !== interval` 的事件（切换瞬间旧订阅迟到消息）。注意 WS 文档 Candle `o/h/l/c` 标 number、快照为 string——统一 `Number()` 后入 chart（`formatSingleCandle` 已如此，新增 `formatWsCandle` 复用同构转换）。

### D4. 切换器 UI

- 周期：`1m 5m 15m 1h 4h 1d` 六档按钮组（14 档中取常用，其余后续扩展，常量集中 `intervalConfig.ts`）。
- 币种：原生 `<select>`，选项来自 `useKline().coinList`（`allMids` keys 过滤 `@` 前缀的 spot 只留 perp），排序稳定；默认 `ETH`。
- 状态：coin/interval 提升至 `KlineView`，驱动 `useKline` 与 URL。

### D5. URL 状态（client 方案，保持 SSG）

`KlineView` 内 `useSearchParams` 读 `coin/interval`（校验白名单，非法回落默认 ETH/1h）；切换时 `router.replace(pathname + ?coin=&interval=, { scroll: false })` 只改 URL 不触发导航。`page.tsx`（server）用 `<Suspense>` 包裹 `KlineView`（Next 要求，且页面保持 SSG 静态生成、metadata 不受 searchParams dynamic 化影响）。避免 server `searchParams` prop（会把页面转为 dynamic 渲染）。

### D6. 订阅生命周期（阶段二）

`useKline` 内：effect deps `[coin, interval]`；订阅成功记入 ref；cleanup 顺序 `unsubscribe() → 忽略回调（cancelled flag）`。依赖 SDK `WebSocketTransport` 自带断线重连 + `resubscribe`；事件回调内做 D3 校验再 setState（candles 用函数式更新避免 stale closure）。`KlineView` 卸载即 effect cleanup，连接与快照请求的竞态同样用 cancelled 收口（现实现已有该模式，保持）。

### D7. 两阶段与 spike 门禁

- **阶段一**（骨架）：D1/D2/D4/D5 —— 纯 HTTP，任何网络条件可用。
- **阶段二**（实时）：第一任务为 spike（最小脚本/临时组件浏览器连 `wss://api.hyperliquid.xyz/ws` 订阅 candle，收 1 条消息即过）；**通过才做 D3/D6 实现**；失败 → 记录 origin/兼容错误为阻塞，tasks 该组标记暂停并汇报，不猜实现。
- 两阶段同属本 change，tasks 分组呈现。

### D8. i18n

messages 新增（zh/en 同构）：`kline.interval`/`kline.coin`（切换器标签）、`kline.loading`/`kline.error`（数据态）等按 UI 实际需要补齐；页面现有 `web3.features.kline*` 标题沿用。

## Risks / Trade-offs

- [浏览器直连 WSS 被 origin 拒绝 / transport 不兼容] → spike 门禁前置，失败即阻塞记录（见 D7），不静默降级。
- [upsert 逻辑错误产生重复/错位蜡烛] → t 为键合并 + 归属校验；手动造消息或高频期(1m)观察验证。
- [订阅泄漏（快速反复切换）] → effect cleanup 强制 unsubscribe + cancelled flag；切换压力测试为验证项。
- [allMids 规模（数百 perp）原生 select 长] → 接受（Non-goal 不做搜索）；如体验差再开增强。
- [SDK 替换类型漂移] → 以 `bunx tsc --noEmit` + 包声明类型为准逐点修；API 官方 README 与现用一致，漂移预期小。
- [SSR/构建] → 全客户端逻辑在 `"use client"` + Suspense，`bun run build` 无 window 错误为验证门。

## Migration Plan

1. 阶段一：SDK 替换 → hook 拆分/增量渲染 → 切换器 → URL 参数 → lint/tsc/build/手动验证。
2. 阶段二：spike →（通过）candle 订阅接入 + upsert + 退订 → 验证；（失败）记录阻塞、本组任务暂停。
- 回滚：阶段独立提交；WSS 仅 `useKline` 内 effect，回退即回到纯快照模式。

## Open Questions

无（币种=动态 allMids、URL 保留、SDK 替换、两阶段单 change 均已确认）。