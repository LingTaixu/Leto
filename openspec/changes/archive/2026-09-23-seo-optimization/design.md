# Design

## Context

- 现状：`app/layout.tsx` 仅一套静态 `metadata`（中文 title/description），无 `metadataBase`/OG/twitter；无 `sitemap.ts`/`robots.ts`；`[locale]` layout 无 hreflang/canonical；kline 页为 client（`"use client"`）无法 `export metadata`；文章页 `blog/[slug]` 已有动态 title/description。
- i18n 已就位：`SUPPORTED_LOCALES`（zh/en）、messages（`resolveMessage`）、文章 `getPosts(locale)`。
- 生产域名未在仓库声明（remote 为 `github.com:LingTaixu/Leto`），绝对 URL 必须可配置。

## Goals / Non-Goals

**Goals:**
- sitemap/robots、逐页 metadata、多语言 hreflang/canonical 全覆盖。
- 站点地址走 `NEXT_PUBLIC_SITE_URL`，缺省时相关输出降级跳过（不编造域名）。

**Non-Goals:**
- 不做 JSON-LD 结构化数据、不引入 seo 库、不改内容与视觉、不实现 RSS。

## Decisions

### D1. 站点地址唯一来源

`NEXT_PUBLIC_SITE_URL`（如 `https://example.com`）。`metadataBase`、`sitemap` entries、`canonical`/`hreflang` 均读它。缺省（未设）时：sitemap 输出空条目或跳过绝对域拼接、不输出 `alternates`；**不硬编码占位域名**。`.env.example` 记录该变量。

### D2. sitemap 生成（app/sitemap.ts）

server 侧构造 entries：对每个 `SUPPORTED_LOCALES` × `["", "/about", "/blog", "/web3", "/web3/notary", "/web3/transfer", "/web3/kline"]` 静态段 + `getPosts(locale)` 文章（带 `lastModified` = date）。仅当 siteUrl 存在时输出绝对 URL。

### D3. robots（app/robots.ts）

`rules: [{ userAgent: "*", allow: "/" }]`，`sitemap: ${siteUrl}/sitemap.xml`（siteUrl 存在时）。

### D4. 根 metadata 补强

`metadataBase`、`openGraph: { siteName, type, locale }`、`twitter: { card }`；title/description 保留现值（中文根）。en 级 SEO 由逐页 generateMetadata 承担。

### D5. 逐页 generateMetadata（双语）

- 首页/about/blog 列表/web3 中心/notary/transfer：server 组件，`params.locale` → `resolveMessage(locale, "xxx.seoTitle"/"xxx.seoDescription")`（messages 新增键）。
- kline：现为 client 页 → 拆 `app/[locale]/web3/kline/page.tsx`（server wrapper，`generateMetadata` + 动态 `import` client 子组件 `KlineView`）；图表逻辑不动。
- 文章页：保留现 title/description，补 `alternates` 与 OG。

### D6. hreflang/canonical（[locale] layout）

在 `app/[locale]/layout.tsx` 输出 `alternates: { canonical: /${locale}... , languages: { zh, en, "x-default": zh } }`；canonical 需当前 pathname——`headers()`/动态路由下用 layout 级仅能给出站点级 canonical（layout 无法知具体 path）。**决策**：逐页 `generateMetadata` 自己输出 `alternates`（用页路径拼），layout 级不做 path 级 canonical（避免错误 canonical）。hreflang 由各页统一 helper `localeAlternates(locale, pathname)` 输出。

### D7. messages SEO 键

`<page>.seoTitle` / `<page>.seoDescription`（zh/en 同构），覆盖首页/about/blog/web3/notary/transfer/kline。

## Risks / Trade-offs

- [未配置 NEXT_PUBLIC_SITE_URL] → sitemap/canonical 降级跳过；部署前必须配置，否则 SEO 输出不完整 → `.env.example` 记录 + tasks 验证含缺省分支。
- [kline 拆 server wrapper 增一层] → 仅包装，client 逻辑不动。
- [metadata 键与 i18n change 耦合] → messages 已就位，新增键两文件同构即可。

## Migration Plan

1. env 定义 + 根 metadata 补强。
2. sitemap.ts + robots.ts。
3. 逐页 generateMetadata + messages 键 + kline wrapper。
4. hreflang helper + 各页 alternates。
5. lint/tsc/build + 分支验证（配置与缺省）。
- 回滚：删 sitemap/robots 与 generateMetadata 即回退到现状。

## Open Questions

- 生产域名具体值（部署时由用户配置 `NEXT_PUBLIC_SITE_URL`；本 change 不猜）。