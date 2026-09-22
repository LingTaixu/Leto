import Link from "next/link";
import { Tag } from "@/components/Tag";

/* ---------- 数据 ---------- */
const contact = {
  name: "Leto",
  email: "taixuling@gmail.com",
  gender: "男",
  age: 27,
};

const skills = [
  "React 全家桶",
  "Vue3 全家桶",
  "Next.js",
  "React Hooks",
  "Web3 前端开发",
  "TypeScript",
  "Uniapp",
  "Web3js",
  "Solidity",
  "echarts.js",
  "Zustand",
  "Node.js",
];

const advantages = [
  {
    title: "项目经验",
    desc: "SaaS 平台、区块链前端、去中心化交易所、小程序、app、SEO、H5、Node 后台、Linux 运维",
  },
  {
    title: "前端开发 6 年",
    desc: "能够一人抵挡前端、后端及运维自动化。深耕 Web3 生态，熟悉主流 EVM 生态及开发",
  },
  {
    title: "管理与架构",
    desc: "高效团队协作、项目管理、技术选型、高难度技术验证、项目结构设计、工具封装与团队提效规范",
  },
];

const jobs = [
  {
    company: "宁德时代",
    range: "2026.07 - 2026.09",
    role: "前端开发 · 可靠性与安全部",
    points: [
      "0-1 开发从产线机器取出数据到 Web 展示",
      "使用 React + Umi + ECharts 开发核心功能风险等级",
      "联动其他前端开发公共组件，复用组件",
      "维护线上项目，修复线上 bug",
    ],
  },
  {
    company: "四川解链科技",
    range: "2025.05 - 2026.03",
    role: "前端开发 · 区块链",
    points: [
      "0-1 开发 Hyperliquid copy trade 跟单交易平台（React + Next）",
      "0-1 开发 Solana / BSC / ETH 的 NFT 生态平台 (cityprotocol.co)",
      "Hyperliquid 生态 launchpad，使用 UNI V2 / V3",
      "Polymarket 预测平台跟单，使用 Zustand 状态管理",
    ],
  },
  {
    company: "郑州蓝语荣新网络科技有限公司",
    range: "2024.03 - 2024.11",
    role: "前端开发 · 区块链",
    points: [
      "升级迭代去中心化产品 TOX 生态 H5 端 (dapp.tox.mobi)",
      "开发去中心化 Meme 网站生态 Match Banana (match-banana.com)",
    ],
  },
  {
    company: "哈希星图",
    range: "2022.06 - 2023.12",
    role: "前端开发 · 区块链",
    points: [
      "根据产品原型结合 Figma 版本迭代，严格做到完全一致",
      "开发中台管理系统与 DeFi Dapp",
      "使用最新 Vue3 setup + TypeScript 开发",
      "IM 聊天软件使用环信 SDK 开发，含群聊与红包等",
    ],
  },
  {
    company: "四川前锋集团",
    range: "2020.10 - 2022.06",
    role: "前端开发 · 计算机软件",
    points: [
      "负责燃气 SaaS、SaaS 中台、缴费小程序前端开发",
      "使用 Jquery + 内嵌 Vue2 开发 SaaS",
      "SaaS 中台使用 React16 + UMI，负责管理中台并添加运营商",
      "优化 SaaS 物联网效果展示",
    ],
  },
];

const projects = [
  {
    name: "IP Strategy Web",
    range: "2026.09",
    href: "/blog/ip-strategy-web-tanstack-router",
    points: [
      "Vite 7 + TanStack Router 文件式路由，从 Next.js 迁移至纯客户端 DApp",
      "Tailwind CSS 4 + Vite 插件链路，构建手动分包优化首屏",
      "RainbowKit / wagmi 与 Solana Wallet Adapter 双链钱包并存",
      "集成 TradingView Charting Library 实现 IP 策略 K 线",
    ],
  },
  {
    name: "Cooking.City",
    range: "2026.09",
    href: "/blog/cooking-city-solana-fair-launch",
    points: [
      "Next.js 15 App Router + next-intl 构建 Solana 公平发射平台",
      "Reown AppKit 钱包接入，Anchor 程序与 Meteora DLMM 流动性集成",
      "Conviction Pool 价格保护与 Referral 推荐机制的前端落地",
      "rewrites 收口多后端域名，规避 CORS 与密钥外泄",
    ],
  },
  {
    name: "IP Strategy Base Service",
    range: "2026.09",
    href: "/blog/ip-strategy-base-service",
    points: [
      "Express 5 + Sequelize + PostgreSQL 搭建策略铸造后端服务",
      "JWT 鉴权 / 参数校验 / 统一错误处理三段式中间件链",
      "策略生命周期管理：先落库后链上验证，异步补偿确认",
      "NFT 交易历史完整 CRUD，decimal.js 保障资产精度",
    ],
  },
  {
    name: "宁德时代安全系统中台",
    range: "2025.07 - 2026.09",
    points: [
      "ToB 平台使用 React + Umi 实现",
      "复杂表单功能，200+ 字段表单联动",
      "对接业务方确定需求和开发进度",
    ],
  },
  {
    name: "ECHOSYNC",
    range: "2025.08 - 2026.03",
    href: "/blog/echosync-hyperliquid-exchange",
    points: [
      "React + Next.js 框架，Zustand 状态管理，next-intl 多语言的去中心化交易所",
      "Hyperliquid SDK 完成 market/limit order、止盈止损去中心化交易",
      "Privy SDK 完成内置托管钱包签名和验证",
      "TradingView + ws 完成 K 线图实现",
      "封装钩子函数监控用户多托管钱包的切换",
      "展示目标地址持仓、交易历史、盈亏、资金费",
      "ERC20 完成 Hyper L2 内部转账、Arb 链上转账",
    ],
  },
  {
    name: "EC-ASTER",
    range: "2025.10 - 2026.03",
    points: [
      "Aster SDK 完成完整 DEX 交易流程，与 Aster 官方合作",
      "兼容 HP 的 Privy 钱包切换流程，同一地址完成交易",
      "接入 Aster 一期人类 VS AI，使用接口数据完成用户展示",
    ],
  },
  {
    name: "EC-Polymarket",
    range: "2025.12 - 2026.03",
    points: [
      "Polymarket SDK 抓取 markets 并前端展示",
      "Privy SDK 完 Polymarket 交易开启",
      "TradingView + ws 完成 K 线，分类 coin 币价 K 线和涨跌 K 线",
      "CLOB SDK 完成下单等交易",
    ],
  },
  {
    name: "Hyper-Launch",
    range: "2025.12 - 2026.03",
    points: [
      "基于 liquidlaunch.app 在 Hyper EVM 制作 launch",
      "使用 UNI v2 / v3 完成交易",
      "TradingView 完成 K 线",
    ],
  },
  {
    name: "Cityprotocol",
    range: "2025.12 - 2026.03",
    points: [
      "BSC / ETH / SOL 上的 NFT 绑定代币",
      "OpenSea API 查询持有 NFT，CoinGecko 内嵌完成代币交易和 K 线",
      "类似 punkstrategy.fun 众筹购买 NFT 后 1.5 倍卖出",
      "接入 Base 与 Farcaster 的 mini App",
    ],
  },
  {
    name: "哈希中台 To B",
    range: "2022.06 - 2023.12",
    points: [
      "Vue3 + TypeScript 自适应中台，媒体查询适配移动端",
      "钱包后台管理：冷热钱包、空投、公链与私钥管理；封装表单/表格/search/上传组件",
      "负责 nginx 搭建、docker 容器管理、阿里云 OSS；低耦合组件用于外包快速构建",
      "Google Authenticator 鉴权钱包登录，路由鉴权与缓存启动",
      "约 600 接口，前端交互独立完成",
    ],
  },
];

/** 区块标题 */
function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-text">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-32 lg:pb-10">
      {/* 个人头部 */}
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-text">
          {contact.name}
        </h1>
        <p className="mt-2 text-lg text-muted">Web3 / 区块链前端工程师</p>
        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm text-muted sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <dt className="text-faint">邮箱</dt>
            <dd>
              <a
                href={`mailto:${contact.email}`}
                className="hover:text-accent transition-colors duration-150"
              >
                {contact.email}
              </a>
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-faint">性别</dt>
            <dd>{contact.gender}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-faint">年龄</dt>
            <dd>{contact.age}</dd>
          </div>
        </dl>
      </header>

      {/* 相关技能 */}
      <Section id="skills" title="相关技能">
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <Tag key={skill} name={skill} className="px-3 py-1.5 text-sm" />
          ))}
        </div>
      </Section>

      {/* 个人优势 */}
      <Section id="advantages" title="个人优势">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {advantages.map((adv) => (
            <div
              key={adv.title}
              className="rounded-lg border border-border/70 bg-surface/50 p-4"
            >
              <h3 className="text-sm font-semibold text-text">{adv.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {adv.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 工作经历 */}
      <Section id="experience" title="工作经历">
        <ol className="relative space-y-8 border-l border-border pl-6">
          {jobs.map((job) => (
            <li key={job.company} className="relative">
              <span className="absolute -left-[1.805rem] top-1 size-2.5 rounded-full bg-accent" />
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-base font-semibold text-text">
                  {job.company}
                </h3>
                <span className="font-mono text-xs text-faint">
                  {job.range}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-faint">{job.role}</p>
              <ul className="mt-3 space-y-1.5">
                {job.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-border" />
                    {point}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Section>

      {/* 项目经历（多张 Card） */}
      <Section id="projects" title="项目经历">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <article
              key={project.name}
              className="flex flex-col rounded-lg border border-border/70 bg-surface/50 p-5 transition-shadow duration-200 hover:shadow-glow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                {project.href ? (
                  <h3 className="text-base font-semibold text-text transition-colors duration-150 hover:text-accent">
                    <Link href={project.href}>{project.name} →</Link>
                  </h3>
                ) : (
                  <h3 className="text-base font-semibold text-text">
                    {project.name}
                  </h3>
                )}
                <span className="shrink-0 font-mono text-xs text-faint">
                  {project.range}
                </span>
              </div>
              <ul className="mt-3 space-y-1.5">
                {project.points.map((point, i) => (
                  <li
                    key={i}
                    className="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <span className="mt-1.5 size-1 shrink-0 rounded-full bg-accent/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
    </main>
  );
}
