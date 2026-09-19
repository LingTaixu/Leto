export type Article = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO yyyy-mm-dd
  readMin: number;
  tags: string[];
  /** 是否为置顶文章（首卡 hairline 加粗 + 辉光最强） */
  pinned?: boolean;
  /** 正文 HTML（与 Prose 组件配合渲染） */
  content?: string;
};

// 真实 Web3 技术复盘案例分析 (Case Studies)
export const posts: Article[] = [
  {
    slug: "echosync-hyperliquid-exchange",
    title: "ECHOSYNC：基于 Hyperliquid L2 的去中心化交易所架构实践",
    summary:
      "独家拆解 ECHOSYNC 交易所实现：使用 Privy 托管多钱包切换、Hyperliquid SDK 实现毫秒级限价单/止盈止损交易，以及 TradingView + WebSocket K 线集成方案。",
    date: "2026-03-10",
    readMin: 12,
    tags: ["nextjs", "web3", "hyperliquid"],
    pinned: true,
    content: `
<h2>项目背景与目标</h2>
<p>ECHOSYNC 是一款高性能的去中心化衍生品跟单交易所。为了向用户提供媲美 CEX 的丝滑体验，同时保留完全的非托管安全性，项目基于 <strong>Hyperliquid Layer 2</strong> 链进行 0-1 的全栈构建，并在前端通过极致优化，实现高频数据的高效渲染。</p>

<h2>核心技术架构图</h2>
<table>
<thead><tr><th>层级</th><th>技术选型</th><th>解决的关键痛点</th></tr></thead>
<tbody>
<tr><td><strong>应用层</strong></td><td>React + Next.js (App Router) + Tailwind CSS</td><td>保证 SEO 表现、首屏极速渲染及高度自适应的移动端适配。</td></tr>
<tr><td><strong>状态机</strong></td><td>Zustand</td><td>处理用户多账户持仓、盈亏数据流、实时资产快照的轻量状态订阅。</td></tr>
<tr><td><strong>钱包层</strong></td><td>Privy SDK</td><td>提供内置托管钱包及社交账号一键登录，兼容多链环境。</td></tr>
<tr><td><strong>交易层</strong></td><td>Hyperliquid SDK</td><td>Market / Limit Order 下单、API 密钥托管跟单签名。</td></tr>
<tr><td><strong>图表层</strong></td><td>TradingView Class + WebSockets</td><td>实时订阅底层 K 线数据流、高刷新画线渲染。</td></tr>
</tbody>
</table>

<h2>高难度技术细节验证与攻关</h2>

<h3>1. 托管钱包的多钱包并发监控钩子</h3>
<p>在跟单交易中，用户往往拥有多个充值钱包或托管钱包。如果用户在插件端（或 Privy 内置钱包）发生地址切换，且前端状态未即时同步，极易造成<strong>签名资产错乱或下单失败</strong>。</p>
<p>我们封装了 <code>useWalletMonitor</code> 钩子函数，结合底层 Provider 实时监听 <code>accountsChanged</code> 事件，并配合 Zustand 强行同步全局上下文：</p>
<pre><code>// 核心签名同步逻辑示意
useEffect(() => {
  if (!privyProvider) return;
  const handleAccounts = (accounts: string[]) => {
    const activeAddress = accounts[0];
    syncUserBalances(activeAddress); // 重新拉取 L2 持仓
    trackWalletSwitch(activeAddress); // 审计埋点
  };
  privyProvider.on("accountsChanged", handleAccounts);
  return () => privyProvider.off("accountsChanged", handleAccounts);
}, [privyProvider]);</code></pre>

<h3>2. 毫秒级下单与交易历史同步</h3>
<p>通过集成 <strong>Hyperliquid SDK</strong>，我们完整重构了非托管的交易流。
前端用户点击“一键跟单”时，我们通过 Privy 完成托管密钥签名，通过 SDK 向 Hyperliquid L2 网关提交 CLOB 撮合单，并将滑点严格控制在 0.5% 以内。同时，使用长连接展示目标交易员的持仓变动、交易历史、盈亏（PNL）与实时资金费，确保跟单延迟控制在 150ms 以内。</p>

<h2>经验总结</h2>
<p>在 Web3 上层开发中，<strong>钱包连接状态、链上数据同步、本地交互高吞吐量</strong> 是三大核心挑战。在 ECHOSYNC 的实践证明：Next.js 服务端预渲染 + 客户端轻量 Zustand 状态分发，是目前复杂 DApp 体验的最优解。</p>
`,
  },
  {
    slug: "polymarket-clob-integration",
    title: "Polymarket 预测市场自动跟单与 CLOB 交易对接",
    summary:
      "如何高效对接 Polymarket 预测平台？解析 Polymarket CLOB SDK 下单流程、基于 Privy 内置地址一键签名，以及利用 TradingView 实时区分代币价与预测涨跌幅 K 线技术方案。",
    date: "2026-02-15",
    readMin: 9,
    tags: ["react", "web3", "polymarket"],
    content: `
<h2>项目背景</h2>
<p>Polymarket 是全球最大的去中心化预测市场平台。为了实现自动化的预测市场策略跟单，我们 0-1 开发了跟单策略平台，打通了 Polymarket 官方的限价订单簿（CLOB）与前端的高频可视化交互。</p>

<h2>核心系统设计</h2>

<h3>1. 使用 CLOB SDK 进行高效下单</h3>
<p>Polymarket 的限价单基于 Polygon 链运行，通过 <strong>CLOB (Central Limit Order Book) SDK</strong> 进行订单的创建与取消。
由于每次下单都需要进行私钥签名（EIP-712），我们接入 <strong>Privy SDK</strong>。当用户在平台开启自动交易后，平台利用 Privy 提供的免密静默签名（Session Keys 概念）直接生成合规签名，并发往 Polymarket Api 节点，避免了普通 DApp 下单时频繁弹窗确认的痛点。</p>

<h3>2. K 线图技术：代币币价 vs 预测涨跌幅</h3>
<p>在图表设计上，Polymarket 交易员不仅需要观察主流代币的价格，更需要监控预测事件本身的“胜率概率 K 线”（价格区间在 $0.01 - $0.99 之间）。</p>
<blockquote><p>解决方案：我们接入 <strong>TradingView Library</strong>，通过自定义 WebSocket 数据喂送源（Datafeed），在前端动态切换两类 K 线：事件胜率涨跌 K 线与 Coin 币价 K 线，利用 Chart Overlay 功能将两组完全不同量级的数据流合并展示，辅助跟单决策。</p></blockquote>

<h2>多语言与全局状态</h2>
<p>利用 <code>next-intl</code> 进行全站多语言部署，针对日、韩、美等预测主流地区进行 SEO 定制优化。全局状态使用 <code>zustand/middleware/persist</code> 强缓存本地核心交易习惯，提升了全站 40% 的弱网留存率。</p>
`,
  },
  {
    slug: "catl-safety-system-form-opt",
    title: "宁德时代安全中台：200+ 字段复杂表单的联动与性能优化",
    summary:
      "在 B2B 可靠性与安全系统开发中，如何解决 200 个以上表单字段、高频联动校验下的卡顿问题？深度复盘基于 React + Umi + 动态表单重构的技术路径。",
    date: "2026-08-10",
    readMin: 8,
    tags: ["react", "frontend", "性能优化"],
    content: `
<h2>面临的挑战</h2>
<p>在宁德时代（CATL）可靠性与安全部，需要将产线精密机器中导出的海量工艺与运行参数，以 0-1 方式直观呈现并提交至 Web 安全系统中台。
系统核心是一张用于设备安全等级和风险评估的<strong>动态复杂大表单</strong>：
- 字段数量超过 200 个；
- 包含高密度的“父子级联动”（例如：当修改工艺 A 温度时，其下 12 个风险等级参数需重新计算并高亮）；
- 表单卡顿会导致产线安全排查人员录入效率腰斩。</p>

<h2>性能瓶颈技术诊断</h2>
<p>初始方案中，使用传统的全量状态驱动，每次输入都会触发整个表单组件树的重新渲染（Reflow & Re-render）。
当字段数 > 150，Input 的按键响应延迟（FID）会飙升到 <strong>280ms</strong> 以上，肉眼可见卡顿。</p>

<h2>性能攻坚策略</h2>

<h3>1. 订阅制非受控表单 (Reactive Form Store)</h3>
<p>我们对表单系统进行了原子化拆分。利用订阅发布模式，将表单数据托管在独立的内存 Store 中。
每个输入组件（Input/Select/Radio）只监听自己对应的字段 Key，只有在被联动的下游字段需要变化时，才由全局总线（Event Bus）派发事件进行精准局部渲染：</p>
<pre><code>// 订阅制表单原子组件
export function AtomicInput({ fieldKey }) {
  const [value, setValue] = useFormValue(fieldKey); // 只订阅当前 fieldKey
  return &lt;input value={value} onChange={e =&gt; setValue(e.target.value)} /&gt;;
}</code></pre>
<p>通过这一重构，全量字段联动时的单次按键 Re-render 范围由 200+ 缩减至精准的 1-3 个，<strong>FID 延迟由 280ms 骤降至 12ms</strong>，彻底消除按键粘连感。</p>

<h3>2. 工艺数据联动与 e-charts 可视化</h3>
<p>为满足实时监控需求，表单提交后会实时触发工艺数据图表绘制。
我们利用 <strong>ECharts</strong> 绘制出精密的多轴运行曲线，并实现了“风险等级动态变色柱状图”，方便安全部一目了然定位故障机器。</p>

<h2>总结</h2>
<p>在企业级中台应用中，面对极端表单场景，<strong>“分治订阅、非受控渲染、公共组件高度复用”</strong> 是核心优化真理。通过封装高度抽象的公共通用表单组件，我们不仅交付了极致流畅的系统，也为安全部后续外包项目和兄弟平台的搭建沉淀了标准的 UI 基础库。</p>
`,
  },
  {
    slug: "cityprotocol-nft-farcaster-integration",
    title: "Cityprotocol：跨链 NFT 资产绑定与 Farcaster Mini-App 实战",
    summary:
      "详解 Cityprotocol 项目开发：在 Base / Solana / BSC 上实现代币绑定、调用 OpenSea API 检索持有关系，以及 Farcaster (Warpcast) Mini-App 协议端无缝接入。",
    date: "2026-01-20",
    readMin: 7,
    tags: ["web3", "设计", "farcaster"],
    content: `
<h2>项目愿景</h2>
<p>Cityprotocol 是一个跨链 NFT 生态策略平台，其核心模式类似于众筹购买蓝筹 NFT（如 OpenSea 上的优质资产），并在增值至 1.5 倍时自动通过去中心化合约售出，反哺生态持有代币的用户。</p>

<h2>开发历程与核心落地</h2>

<h3>1. 跨链资产绑定与校验</h3>
<p>系统需要同时兼容 BSC、ETH 和 Solana 链。我们基于 **Solidity** 编写了代币绑定存证合约，前端使用 Web3.js 完成跨链签名互认。
为了极速验证用户钱包内持有的 NFT，我们设计了以下校验流：</p>
<pre><code>// 调用 OpenSea API 检索用户特定 Collection 持有状态
async function verifyUserNFT(address, collectionSlug) {
  const url = \`https://api.opensea.io/v2/chain/ethereum/account/\${address}/nfts\`;
  const res = await fetch(url, { headers: { "X-API-KEY": OPENSEA_API_KEY } });
  const data = await res.json();
  return data.nfts?.some(nft => nft.contract.includes(collectionSlug));
}</code></pre>
<p>结合 CoinGecko 嵌入式小组件，在前端提供实时的 Token K 线和代币汇率兑换，免去用户跳转第三方图表网站的不便。</p>

<h3>2. 拥抱去中心化社交：Warpcast / Farcaster 接入</h3>
<p>去中心化社交协议 <strong>Farcaster</strong>（客户端 Warpcast）是目前 Web3 原生用户最大的活跃阵地。我们 0-1 将 Cityprotocol NFT 交易跟单策略接入 Farcaster Mini-App（Frames v2）。
用户在 Warpcast 信息流中直接点击，即可直接在移动端社交软件内置浏览器中，调起 Privy 与 Base 链 L2 执行 1.5 倍众筹质押签名交易。这一全流程社交转化，让项目上线首周新增了 5,000+ 链上活跃用户。</p>

<h2>关于 Web3 社交生态的前瞻</h2>
<p>未来 Web3 项目的流量入口不再仅仅是推特或官网，<strong>基于 Farcaster/Lens 等协议的社交小应用 (Mini App / Frames)</strong>，由于其即时交互和钱包免密签名的特性，将成为主流。尽早布局此类上层应用集成，能够为平台带来降维打击式的用户转化。</p>
`,
  },
];

/** 按日期倒序返回文章 */
export function getPosts(): Article[] {
  return [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 通过 slug 查询单篇 */
export function getPostBySlug(slug: string): Article | undefined {
  return posts.find((p) => p.slug === slug);
}

/** 通过标签查询文章 */
export function getPostsByTag(tag: string): Article[] {
  return posts.filter((p) => p.tags.includes(tag));
}

/** 所有标签（去重，按出现频次排序） */
export function getAllTags(): string[] {
  const map = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) {
      map.set(t, (map.get(t) ?? 0) + 1);
    }
  }
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag);
}

/** 格式化日期为中文短格式 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}