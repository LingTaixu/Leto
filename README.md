# Leto

> 尝试使用 Agent 构建的一个博客站点，从毛坯到精装修。以 AI Agent（opencode + OpenSpec spec-driven 流程）逐步搭建，风格为 neubrutalism。

## 技术栈

- **框架**: Next.js 16 (App Router) + React 19 + TypeScript
- **包管理**: bun
- **样式**: Tailwind CSS v4 + neubrutalism 设计令牌（`--accent`/`--border`/`shadow-neu` 等 CSS 变量）
- **多语言**: `zh` / `en` 双 locale（`/zh`、`/en` 前缀，`[locale]` 动态路由 + 消息文件，hreflang/canonical）
- **内容**: markdown 博文（`content/posts/`，gray-matter + remark/unified），全静态生成
- **链上**: `@nktkas/hyperliquid`（K 线行情）、wagmi + viem（BSC 存证/转账）、RainbowKit
- **图表**: lightweight-charts v5（蜡烛图 + 成交量副窗格）
- **数据**: 全站 sitemap / robots / JSON-LD（SEO）

## 快速开始

```bash
bun install
bun run dev       # http://localhost:3000
bun run build     # 静态生成 + typecheck
bun run lint      # eslint
```

## 路由

| 路径 | 说明 |
|---|---|
| `/zh` / `/en` | 首页（three.js 粒子首屏 splash + 文章流） |
| `/zh/blog` · `/zh/blog/[slug]` | 技术博客列表 / 详情（16 篇 markdown 文章） |
| `/zh/about` | 关于 |
| `/zh/web3` | Web3 功能实验室（能力卡片入口） |
| `/zh/web3/kline` | Hyperliquid K 线图（ETH/1h，交易所风格） |
| `/zh/web3/notary` | 数据存证（BSC Testnet，写入链上事件日志） |
| `/zh/web3/transfer` | 原生币转账（BSC Testnet BNB） |

## Web3 功能实验室

三款实验性工具，均需连接钱包（RainbowKit）：

- **K 线图表** `/web3/kline` — Hyperliquid perp 合约（234 个）K 线，支持：
  - 周期切换 `1m/5m/15m/1h/4h/1d`、币种搜索选择器
  - 蜡烛图 + 成交量副窗格 + 十字线 OHLC 图例，明暗主题跟随系统
  - 24h 统计栏（价格/涨跌幅/成交量/OI/资金费率）、Order Book 深度、近期成交
  - WSS 实时蜡烛推送、历史分页懒加载（去重保序）
  - URL 状态同步（`?coin=&interval=`）
- **数据存证** `/web3/notary` — 将 ≤64 字节数据写入 BSC Testnet 链上事件日志，哈希即证据
- **原生币转账** `/web3/transfer` — 查询地址 BNB 余额并发起转账

## 开发约定

- **OpenSpec spec-driven**：功能先经 `openspec/` change 规划（proposal → specs → design → tasks）再实现；主 spec 见 `openspec/specs/`
- **Agent 工作流**：`/opsx-propose` 提变更、`/opsx-apply` 实现、`/opsx-archive` 归档
- **i18n**：文案在 `messages/{zh,en}/` 消息文件中，新页面先加文案键
- **路由 + 元数据**：页面使用 `generateMetadata` + `localeAlternates()` 输出 hreflang/canonical