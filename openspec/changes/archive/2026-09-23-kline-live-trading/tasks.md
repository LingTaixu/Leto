# Tasks

## 1. 阶段一：SDK 替换与骨架

- [x] 1.1 `bun remove @devmikets/hyperliquid-sdk && bun add @nktkas/hyperliquid`，迁移 `components/kline/*`、`formatKline.ts` 全部 import 与类型；验证 `bunx tsc --noEmit` 通过
- [x] 1.2 新建 `components/kline/useKline.ts`：按 `coin/interval` 拉 `candleSnapshot`（近 30 天，默认 ETH/1h）、`InfoClient.allMids()` 取币种列表（过滤 spot 留 perp），state 返回 candles/coinList/loading/error，含请求竞态 cancelled 收口；WSS 实时经 `onCandle` imperative 转发不触发 React 渲染
- [x] 1.3 重构 `TradingView.tsx` 增量渲染：chart 随容器建一次、历史 `series.setData`、初始 `setVisibleLogicalRange`（最近 100 根 + 右侧留白）、主题 `applyOptions`、`apiRef.update` 直通 `series.update`
- [x] 1.4 `intervalConfig.ts`（周期 6 档 + `INTERVAL_SECONDS` + 分页参数）+ 切换器 UI；`messages/{zh,en}/kline.json` 文案键
- [x] 1.5 URL 状态：`useSearchParams` 读 `coin/interval`（白名单校验、默认 ETH/1h），`router.replace` 同步；`page.tsx` 以 `<Suspense>` 包裹

## 2. 阶段二：WSS 实时（spike 门禁）

- [x] 2.1 Spike：浏览器可建立 `wss://api.hyperliquid.xyz/ws`（`WebSocketTransport` + `SubscriptionClient.candle`）收 candle 消息；失败则记录阻塞、本阶段暂停
- [x] 2.2 `useKline` 接入 candle 订阅：`formatWsCandle`、`series.update` upsert、`s`/`i` 归属校验、effect cleanup `unsubscribe()`
- [x] 2.3 连接与竞态：切换退订防重复流、断网重连（SDK resubscribe）

## 3. 历史数据懒加载

- [x] 3.1 `intervalConfig` 周期秒数映射与分页参数（`LOAD_BATCH`/`LOAD_THRESHOLD`）；`useKline.loadOlder`（以最早根为 `endTime` 向前取一批、前插合并、并发锁、空批标记 exhausted；`epoch` 区分快照/切换）
- [x] 3.2 `TradingView` 监听 `subscribeVisibleLogicalRangeChange`（`from <= 阈值` 触发 `onNeedOlder`）；`resetKey` 区分快照重置与前插增量，前插时平移可见逻辑范围保持视点不跳
- [x] 3.3 `KlineView` 接线（`resetKey=epoch`、`onNeedOlder→loadOlder`、加载中/已至最早提示与 i18n 键 `kline.loadingOlder`/`kline.oldest`）

## 4. 验证

- [x] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 4.2 运行 `bun run build` 成功：`/[locale]/web3/kline` 仍静态生成、无 `window is not defined`、无 Suspense 缺失告警
- [ ] 4.3 手动验证：切换币种/周期、URL 分享恢复（`?coin=&interval=`）、明暗主题跟随；1m 实时蜡烛原地更新无重复根、切换退订无泄漏；**向左滚动到历史边缘自动加载更早 K 线、视点不跳、至最早显示"已到最早数据"**