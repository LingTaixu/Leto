import Link from "next/link";
import { ArticleList } from "@/components/ArticleCard";
import { getPosts } from "@/lib/posts";

export default function Home() {
  const articles = getPosts();

  return (
    <main className="mx-auto w-full max-w-[62.5rem] flex-1 px-6 py-10 pb-28 lg:pb-10">
      {/* 个人简介 Hero */}
      <section className="mb-12">
        <p className="font-mono text-sm text-accent">hello, 我是 Leto</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-text">
          Web3 区块链前端工程师
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          6 年前端开发经验，深耕 Web3 生态与主流 EVM。
          擅长构建去中心化交易所、Hyperliquid / Polymarket
          跟单平台、NFT 生态与复杂 ToB 中台。欢迎
          <Link
            href="/about"
            className="text-accent underline underline-offset-2 hover:text-accent-hover transition-colors duration-150"
          >
            查看我的简历
          </Link>
          。
        </p>
      </section>

      {/* 技术文章 / 案例 */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-text">
            项目技术复盘
          </h2>
          <Link
            href="/blog"
            className="text-sm text-muted transition-colors duration-150 hover:text-accent"
          >
            全部 →
          </Link>
        </div>
        <ArticleList articles={articles} />
      </section>
    </main>
  );
}