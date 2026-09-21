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
  {
    slug: "ip-strategy-base-service",
    title: "IP Strategy 后端服务：Express 5 + Sequelize 构建策略铸造 API",
    summary:
      "为 IP 资产代币化平台从零搭建后端：Express 5 + Sequelize + PostgreSQL 数据层、JWT 鉴权与校验中间件链、Solana 链上策略与 NFT 历史记录的完整 CRUD 设计。",
    date: "2026-09-16",
    readMin: 10,
    tags: ["node", "web3", "后端"],
    content: `
<h2>项目定位</h2>
<p><code>ip-strategy-base-service</code> 是 IP Strategy 平台的后端基础服务。它承担三件事：<strong>用户鉴权</strong>、<strong>策略（Strategy）的生命周期管理</strong>，以及 <strong>IP/NFT 交易历史</strong>的记录与查询。</p>
<p>技术选型偏向「稳」而非「新」——用最成熟的 Express + Sequelize 组合，把链上交互的复杂性收敛在服务端。</p>

<h2>技术栈一览</h2>
<table>
<thead><tr><th>层次</th><th>选型</th><th>说明</th></tr></thead>
<tbody>
<tr><td>运行时</td><td>Bun + TypeScript</td><td>直接执行 <code>.ts</code>，开发期免编译</td></tr>
<tr><td>Web 框架</td><td>Express 5</td><td>原生支持 async 错误冒泡，不再需要 try/catch 包装</td></tr>
<tr><td>ORM</td><td>Sequelize 6</td><td>配合 <code>pg</code> / <code>pg-hstore</code> 连接 PostgreSQL</td></tr>
<tr><td>链上 SDK</td><td>@coral-xyz/anchor</td><td>Solana 程序交互</td></tr>
<tr><td>资产查询</td><td>opensea-js + viem</td><td>NFT 归属查询与 EVM 读链</td></tr>
<tr><td>日志</td><td>winston + morgan</td><td>结构化日志 + HTTP 访问日志</td></tr>
</tbody>
</table>

<h2>路由设计：按资源域拆分</h2>
<p>入口 <code>src/app.ts</code> 只做装配，业务路由按资源维度挂载，保持每个 controller 的职责单一：</p>
<pre><code>app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRouter);

// strategy
app.post("/api/v1/strategy", jwtChecker, validate(parseCreateStrategyTxReqValidators), strategyController.createStrategy);
app.get("/api/v1/strategy/:id", validate(findStrategyByIdParamValidators), strategyController.findStrategyById);
app.post("/api/v1/strategy/:id/verify", jwtChecker, validate(verifyStrategyValidators), strategyController.verifyStrategy);
app.get("/api/v1/strategies", strategyController.listStrategies);
app.get("/api/v1/self_strategies", jwtChecker, strategyController.listSelfStrategies);</code></pre>
<p>注意 <code>strategies</code>（公开列表）与 <code>self_strategies</code>（我的策略）被拆成两个端点，而不是靠 query 参数区分——这样鉴权中间件可以精确挂载，避免「公开接口里混入私有逻辑」的常见坑。</p>

<h2>中间件链：鉴权与校验分离</h2>
<p>我们把横切关注点拆成三个独立中间件，按需组合：</p>
<pre><code>// 1. JWT 鉴权 —— 解析并挂载 req.user
jwtChecker

// 2. 参数校验 —— express-validator，校验失败直接 400
validate(parseCreateStrategyTxReqValidators)

// 3. 统一错误处理 —— 挂在路由最后
app.use(customErrorMiddleware);</code></pre>
<p>这种「鉴权 → 校验 → 业务」的线性链条，让 controller 内部可以假定输入一定合法，大幅减少防御性代码。</p>

<h2>链上交互：求解耦</h2>
<p>策略创建的本质是「记录一笔链上交易」：前端在钱包签名后提交交易哈希，后端落库并异步验证。因此数据模型围绕 <code>txHash</code> 建立，验证通过后才把策略标记为有效。</p>
<blockquote><p>关键设计：<strong>先落库、后验证</strong>。链上确认存在不确定性，同步等待会拖垮接口响应；把验证做成独立端点（<code>/strategy/:id/verify</code>）后，前端可以轮询或由定时任务补偿。</p></blockquote>

<h2>NFT 历史记录 CRUD</h2>
<p>交易历史是高频读写场景，提供增删改查四个动作，其中变更操作全部要求鉴权：</p>
<pre><code>POST /api/v1/nft_history            // 新增
POST /api/v1/nft_history/:id/update // 更新
POST /api/v1/nft_history/:id/delete // 删除
GET  /api/v1/nft_histories          // 列表（分页）</code></pre>
<p>变更类操作使用 <code>POST</code> 而非 <code>PATCH/DELETE</code>，是为了兼容部分网关与客户端对非幂等方法的限制——这是实际部署中很常见的妥协。</p>

<h2>工程化小结</h2>
<ul>
<li><strong>上传</strong>用 multer 独立成 <code>/upload</code> 路由，与业务解耦；</li>
<li><strong>数值处理</strong>用 <code>decimal.js</code> + <code>bn.js</code>，避免浮点误差侵蚀资产计算；</li>
<li><strong>地址编码</strong>用 <code>bs58</code>，兼容 Solana 的 Base58 格式；</li>
<li><strong>环境配置</strong>集中在 <code>src/config.ts</code>，杜绝散落的 <code>process.env</code>。</li>
</ul>
<p>后端服务的价值不在于用了多少新框架，而在于<strong>把不确定性（链上、网络、第三方 API）收敛在可控的边界内</strong>。这套服务的分层，就是围绕这个目标设计的。</p>
`,
  },
  {
    slug: "cooking-city-solana-fair-launch",
    title: "Cooking.City：Solana 公平发射平台的 Next.js 15 全栈实践",
    summary:
      "拆解 Solana 公平发射平台 Cooking.City：Next.js 15 App Router + next-intl 多语言、Reown AppKit 钱包接入、Anchor 程序与 Meteora DLMM 流动性集成，以及防狙击与 Conviction Pool 的工程实现。",
    date: "2026-09-12",
    readMin: 11,
    tags: ["nextjs", "solana", "web3"],
    content: `
<h2>平台要解决什么问题</h2>
<p>Cooking.City 是一个建立在 Solana 上的<strong>公平发射（Fair Launch）平台</strong>。它要对抗的是代币发行中最常见的两类不公：<strong>狙击（Sniper）</strong>与<strong>不公平的筹码分配</strong>。</p>
<p>为此平台引入了两个核心机制：<strong>Conviction Pool</strong>（信念池，提供价格保护）与 <strong>Referral Mechanism</strong>（推荐机制，让分发更均衡）。</p>

<h2>技术栈</h2>
<table>
<thead><tr><th>维度</th><th>选型</th></tr></thead>
<tbody>
<tr><td>框架</td><td>Next.js 15.1 App Router + React 19</td></tr>
<tr><td>UI 层</td><td>HeroUI + Tailwind CSS 3.4</td></tr>
<tr><td>国际化</td><td>next-intl（<code>[locale]</code> 动态段）</td></tr>
<tr><td>钱包</td><td>Reown AppKit + Solana Adapter</td></tr>
<tr><td>链上</td><td>@coral-xyz/anchor、SPL Token、Metaplex</td></tr>
<tr><td>流动性</td><td>Meteora DLMM / Dynamic Bonding Curve</td></tr>
<tr><td>行情</td><td>@jup-ag/api、klinecharts、echarts</td></tr>
<tr><td>动效</td><td>framer-motion / motion、lottie-react</td></tr>
</tbody>
</table>

<h2>Provider 分层：上下文不能乱套</h2>
<p>根布局里 Provider 的嵌套顺序是经过设计的，<code>AuthProvider</code> 依赖钱包状态，而 <code>PriceProvider</code> 依赖网络请求上下文：</p>
<pre><code>&lt;ContextProvider&gt;
  &lt;HeroUIProvider&gt;
    &lt;ToastProvider /&gt;
    &lt;PriceProvider&gt;
      &lt;AuthProvider&gt;{children}&lt;/AuthProvider&gt;
    &lt;/PriceProvider&gt;
  &lt;/HeroUIProvider&gt;
&lt;/ContextProvider&gt;</code></pre>
<blockquote><p>顺序原则：<strong>被依赖者在外层</strong>。钱包连接在 <code>ContextProvider</code>，登录态在 <code>AuthProvider</code>——所以 Auth 必须能读到钱包，反之则不行。</p></blockquote>

<h2>国际化：App Router 下的 <code>[locale]</code></h2>
<p>通过 <code>next-intl</code> 插件接管路由，页面组件以 Promise 形式接收 <code>params</code>：</p>
<pre><code>export default async function RootLayout({
  children,
  params,
}: Readonly&lt;{ children: React.ReactNode; params: { locale: string } }&gt;) {
  return &lt;html lang={params.locale} className="dark"&gt;{children}&lt;/html&gt;;
}</code></pre>
<p>注意 <code>&lt;html lang&gt;</code> 直接吃 locale，这对 SEO 与无障碍朗读都是必要的。</p>

<h2>接口代理：rewrites 收口</h2>
<p>前端不直连多个后端域名，而是在 <code>next.config.ts</code> 里用 rewrites 统一代理，避免 CORS 与密钥外泄：</p>
<pre><code>async rewrites() {
  const apiBaseUrl = process.env.API_BASE_URL || "https://api.cooking.city";
  const v2BaseUrl  = process.env.V2_BASE_URL  || "https://dexapi.gemsgun.com";
  return {
    beforeFiles: [
      { source: "/api/:path*",    destination: \`\${apiBaseUrl}/api/:path*\` },
      { source: "/twitter/:path*", destination: \`\${apiBaseUrl}/twitter/:path*\` },
      { source: "/v2/:path*",     destination: \`\${v2BaseUrl}/v2/:path*\` },
    ],
  };
}</code></pre>

<h2>防狙击：双 Config 设计</h2>
<p>平台为普通发射与防狙击发射准备了两套链上配置 ID，通过环境变量注入：</p>
<pre><code>NEXT_PUBLIC_CONFIG_ID: "ALEKAF3Q48Vp6NV1uFEKSopAfFUpGEixJgEdTEdCcHvx"
NEXT_PUBLIC_ANTI_SNIPER_CONFIG_ID: "FQYWAQd6JgLgpbhq1zo4VoCPwLyAwB2uNZqceGPTrvMe"</code></pre>
<p>把「策略」做成配置而非代码分支，好处是新增发射模式时无需改动前端逻辑。</p>

<h2>稳定性与性能取舍</h2>
<ul>
<li><strong>关闭图片优化</strong>（<code>images.unoptimized = true</code>）：官方注释写明是为规避内存泄漏，代价是牺牲自动压缩；</li>
<li><strong>生产构建移除 console</strong>：用 Terser 的 <code>drop_console</code>，减少线上噪音日志；</li>
<li><strong>外部依赖白名单</strong>：把 <code>pino-pretty</code>、<code>lokijs</code>、<code>encoding</code> 排除出打包，解决 WalletConnect 系依赖在 Node 端的兼容问题；</li>
<li><strong>全局 CORS 头</strong>：在 <code>headers()</code> 中统一放开，便于 DApp 嵌入与第三方集成。</li>
</ul>

<h2>复盘</h2>
<p>Solana 生态的前端复杂度，主要来自<strong>钱包标准碎片化</strong>与<strong>链上程序版本演进</strong>。这个项目的应对方式是把这些都收敛到 <code>next.config.ts</code> 与 Provider 层——业务组件只消费 hook，不感知底层差异。</p>
`,
  },
  {
    slug: "ip-strategy-web-tanstack-router",
    title: "IP Strategy Web：Vite 7 + TanStack Router 的 Web3 前端重构",
    summary:
      "从 Next.js 迁移到 Vite + TanStack Router 的完整实践：文件式路由自动生成、useRouter→useNavigate 与 lodash→es-toolkit 的迁移经验、多链钱包接入与 TradingView 图表集成。",
    date: "2026-09-05",
    readMin: 9,
    tags: ["react", "vite", "web3"],
    content: `
<h2>为什么从 Next.js 迁到 Vite</h2>
<p>IP Strategy 是一个<strong>纯客户端 DApp</strong>：没有 SEO 需求，没有服务端数据获取，所有状态都来自钱包与链上 RPC。在这种场景下，Next.js 的 SSR 能力不仅用不上，还会带来额外的构建复杂度。</p>
<p>迁移后的技术栈是 <strong>Vite 7 + TanStack Router + Tailwind CSS 4</strong>——更轻、更快、更贴近 SPA 的本质。</p>

<h2>文件式路由：目录即路由</h2>
<p>路由由 <code>@tanstack/router-plugin</code> 自动扫描 <code>src/pages</code> 生成：</p>
<pre><code>tanstackRouter({
  target: 'react',
  routesDirectory: './src/pages',
})</code></pre>
<p>每个页面导出一个 <code>Route</code> 对象，约定清晰：</p>
<pre><code>export const Route = createFileRoute('/home/')({
  component: RouteComponent,
});

function RouteComponent() {
  return &lt;div&gt;...&lt;/div&gt;;
}</code></pre>
<p>动态参数用 <code>$</code> 前缀（如 <code>/user/$id</code>），以 <code>-</code> 开头的目录会被忽略（如 <code>-components</code>），非常适合把页面私有组件就近放置。</p>

<h2>迁移中的三个高频改动</h2>
<h3>1. 路由跳转：useRouter → useNavigate</h3>
<pre><code>// 迁移前
import { useRouter } from "next/navigation";
const router = useRouter();
router.push('/launch/create');

// 迁移后
import { useNavigate } from "@tanstack/react-router";
const navigate = useNavigate();
navigate({ to: '/launch/create' });</code></pre>

<h3>2. 工具库：lodash → es-toolkit</h3>
<pre><code>// 迁移前
import { includes, reject } from "lodash";
// 迁移后
import { includes, reject } from "es-toolkit/compat";</code></pre>
<p>迁移成本极低，收益是<strong>体积与 Tree-shaking 表现显著更好</strong>（lodash 的 CJS 形态对现代打包器并不友好）。</p>

<h3>3. 目录约定：page.tsx → index.tsx</h3>
<p>App Router 的 <code>page.tsx</code> 统一改为 <code>index.tsx</code>，与 TanStack Router 的「目录即路由」模型对齐。</p>

<h2>多链钱包接入</h2>
<p>项目同时支持 EVM 与 Solana，两套适配器并存：</p>
<ul>
<li><strong>EVM</strong>：RainbowKit + wagmi + viem；</li>
<li><strong>Solana</strong>：<code>@solana/wallet-adapter-*</code> + Reown AppKit Solana Adapter；</li>
<li><strong>统一入口</strong>：通过 <code>SelectChainModal</code> 让用户选择目标链。</li>
</ul>

<h2>图表：TradingView Charting Library</h2>
<p>K 线使用 TradingView 官方库。由于它不通过 npm 分发，迁移时需额外处理：</p>
<pre><code># 拷贝静态资源到 src（Vite 需要可控的资源路径）
./copy_charting_library_files.sh</code></pre>
<p>这一步在 Next.js 下可以靠 <code>public</code> 目录兜底，但在 Vite 中必须显式拷贝，否则构建产物会缺文件。</p>

<h2>Tailwind CSS 4 的插件变化</h2>
<p>v4 用 Vite 插件替代了 PostCSS 链路：</p>
<pre><code>import tailwindcss from '@tailwindcss/vite';
// vite.config.ts
plugins: [tailwindcss(), react(), tsconfigPaths(), nodePolyfills()]</code></pre>
<blockquote><p>踩坑提示：升级到 v4 后，IDE 的类名提示需要在每个项目的 <code>global.css</code> 中显式引入 Tailwind，不能只依赖全局配置。</p></blockquote>

<h2>构建配置的两个关键点</h2>
<h3>Node Polyfill</h3>
<p>Web3 依赖链大量使用 Node 内置模块（<code>buffer</code>、<code>stream</code>、<code>crypto</code>），必须挂 <code>vite-plugin-node-polyfills</code> 才能在浏览器运行。</p>
<h3>手动分包</h3>
<pre><code>manualChunks: {
  vendor: ['react', 'react-dom', 'wagmi'],
}</code></pre>
<p>把体积大且更新频率低的依赖单独成 chunk，避免业务代码一改就让用户重新下载整个 vendor 包。</p>

<h2>子路径部署</h2>
<pre><code>base: '/ipstrategy/',
</code></pre>
<p>设置 <code>base</code> 后，产物可直接部署到域名子路径下，无需额外改写资源引用。</p>

<h2>复盘</h2>
<p>技术选型的第一原则是<strong>匹配场景</strong>。当项目不需要 SSR 时，Vite + TanStack Router 提供的类型安全路由、极快的 HMR 与更简单的构建链路，是比「默认选 Next.js」更理性的答案。</p>
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

/** 格式化日期为中文短格式 */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}