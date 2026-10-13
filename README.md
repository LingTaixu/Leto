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
- **数据**: sitemap / robots（SEO；桌面化后 sitemap 收缩为语言入口）
- **桌面外壳**: 自研窗口管理（context + useReducer + Pointer Events，零新依赖），应用注册表 + lazy 加载窗口内容

## 快速开始

```bash
bun install
bun run dev       # http://localhost:3000
bun run build     # 静态生成 + typecheck
bun run lint      # eslint
```

## 路由（桌面 OS 单页应用）

站点为「桌面 OS」形态：`/zh` / `/en` 是唯一页面，功能以窗口应用呈现，通过 `?app=` 深链直达；旧路由 301 至对应深链。

| 路径 | 说明 |
|---|---|
| `/zh` / `/en` | 桌面入口（three.js splash → 壁纸/图标/窗口/任务栏） |
| `?app=home` | 首页窗口（Welcome / 最新文章） |
| `?app=blog` · `?app=blog&slug=<slug>` | 博客窗口：列表 ↔ 详情（16 篇 markdown 文章） |
| `?app=about` | 关于窗口 |
| `?app=kline` | Hyperliquid K 线图窗口（ETH/1h，交易所风格） |
| `?app=notary` | 数据存证窗口（BSC Testnet，写入链上事件日志） |
| `?app=transfer` | 原生币转账窗口（BSC Testnet BNB） |

窗口能力：拖拽移动、8 向缩放、最小化/最大化/关闭、焦点 z 序、任务栏三态切换；移动端降级为全屏单窗口。

## Web3 功能实验室（桌面窗口）

三款实验性工具窗口，均需连接钱包（RainbowKit，任务栏常驻）：

- **K 线图表** `?app=kline` — Hyperliquid perp 合约（234 个）K 线，支持：
  - 周期切换 `1m/5m/15m/1h/4h/1d`、币种搜索选择器
  - 蜡烛图 + 成交量副窗格 + 十字线 OHLC 图例，明暗主题跟随系统
  - 24h 统计栏（价格/涨跌幅/成交量/OI/资金费率）、Order Book 深度、近期成交
  - WSS 实时蜡烛推送、历史分页懒加载（去重保序）
  - URL 状态同步（`?coin=&interval=`）
- **数据存证** `?app=notary` — 将 ≤64 字节数据写入 BSC Testnet 链上事件日志，哈希即证据
- **原生币转账** `?app=transfer` — 查询地址 BNB 余额并发起转账

## 开发约定

- **OpenSpec spec-driven**：功能先经 `openspec/` change 规划（proposal → specs → design → tasks）再实现；主 spec 见 `openspec/specs/`
- **Agent 工作流**：`/opsx-propose` 提变更、`/opsx-apply` 实现、`/opsx-archive` 归档
- **i18n**：文案在 `messages/{zh,en}/` 消息文件中，新页面先加文案键
- **路由 + 元数据**：桌面入口页使用 `generateMetadata` + `localeAlternates()` 输出 hreflang/canonical；旧路由重定向规则在 `proxy.ts`