# Proposal

## Why

站点无 `sitemap`/`robots`，仅根 layout 一套静态 `metadata`，多语言页面缺 `hreflang`/canonical 与逐页 title/description，搜索引擎难以发现与索引 `/zh`、`/en` 全部路由与文章。为全站补齐 SEO 基础能力。

## What Changes

- 新增 `app/sitemap.ts`：覆盖全部静态路由（`/zh|/en` × 首页/about/blog/web3/web3/{notary,transfer,kline}）与全部文章 `/zh|/en/blog/<slug>`，绝对 URL 以 `NEXT_PUBLIC_SITE_URL` 为 base（未配置时跳过 sitemap 输出该域）。
- 新增 `app/robots.ts`：允许抓取全部路径，回指 sitemap。
- 根 layout `metadata` 补强：`metadataBase`（来自 `NEXT_PUBLIC_SITE_URL`）、`openGraph`（siteName/type/locale）、`twitter` 卡片；保留现有 title/description。
- 各页面（`/zh|/en` 首页、about、blog、web3 中心、notary、transfer、kline）补 `generateMetadata`（title/description，来自 messages 双语键；kline 为 client 页需 server wrapper 才能导出 metadata）。文章详情页已有动态 title，补 `openGraph`/canonical。
- `[locale]` layout 输出 `alternates.canonical` 与 `languages`（`hreflang`: zh/en + `x-default`→zh）。
- messages 新增 metadata 用 title/description 键（zh/en 同构）。
- **Non-goals**：不做结构化数据 JSON-LD、不引入第三方 SEO 库、不改内容与视觉、不实现 RSS（Footer `/rss.xml` 死链不在本 change）。

## Capabilities

### New Capabilities

- `seo`: 全站 SEO——sitemap/robots 产出、逐页 metadata（title/description/OG）、多语言 hreflang 与 canonical。

### Modified Capabilities

<!-- 无现有 spec 的需求被修改（kline 页 metadata 属新页面范畴，不改 kline-chart 行为要求） -->

## Impact

- 代码：`app/sitemap.ts`、`app/robots.ts`（新增）、`app/layout.tsx`（metadata 补强）、`app/[locale]/layout.tsx`（hreflang/canonical）、各页 `generateMetadata`、`app/[locale]/web3/kline/page.tsx` 拆 server wrapper、`messages/{zh,en}.json`。
- 配置：新增 `NEXT_PUBLIC_SITE_URL` 环境变量（canonical/sitemap 绝对 URL 依据；缺省时相应输出降级跳过）。
- 依赖：无新增。