# Tasks

## 1. 站点地址与根 metadata

- [x] 1.1 定义 `NEXT_PUBLIC_SITE_URL`（读取 helper，缺省返回 undefined）并在 `.env.example` 记录；验证 helper 在未配置与已配置两种情况的行为
- [x] 1.2 `app/layout.tsx` 补强根 metadata：`metadataBase`、`openGraph`（siteName/type）、`twitter` 卡片（有 siteUrl 时输出，缺省跳过 base）；验证 head 含对应元素

## 2. sitemap 与 robots

- [x] 2.1 新建 `app/sitemap.ts`：遍历 `SUPPORTED_LOCALES` × 静态路由 + `getPosts(locale)` 文章，输出绝对 URL（siteUrl 存在时）；验证 `/sitemap.xml` 含 zh/en 全部静态页与文章条目
- [x] 2.2 新建 `app/robots.ts`：allow 全部 + 回指 sitemap；验证 `/robots.txt` 输出

## 3. 逐页 metadata（双语）

- [x] 3.1 `messages/{zh,en}.json` 新增各页 `seoTitle`/`seoDescription` 键（首页/about/blog/web3/notary/transfer/kline，同构）；验证键覆盖两文件一致
- [x] 3.2 各 server 页（首页、about、blog 列表、web3 中心、notary、transfer）实现 `generateMetadata`（`params.locale` + `resolveMessage`）；验证 head 含各页 title/description
- [x] 3.3 kline 页拆 server wrapper：`app/[locale]/web3/kline/page.tsx` 改为 server（`generateMetadata` + 动态 import client `KlineView`）；验证 `/zh/web3/kline` 与 `/en/web3/kline` head 含 title/description 且图表正常
- [x] 3.4 文章详情页 `blog/[slug]/page.tsx` 补 `openGraph`；验证文章 head

## 4. hreflang 与 canonical

- [x] 4.1 新增 `localeAlternates(locale, pathname)` helper（返回 `languages`：zh/en + `x-default`→zh，与 `canonical`）；验证输出结构
- [x] 4.2 各页 `generateMetadata` 接入 `alternates`（`/{locale}` 及子路径）；验证 `/zh/blog` head 含 canonical 与 hreflang、`/en/blog` 对称

## 5. 验证

- [x] 5.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 5.2 运行 `bun run build` 成功，含 `/sitemap.xml`、`/robots.txt`，各 locale 页面 metadata 齐全
- [x] 5.3 手动验证：`NEXT_PUBLIC_SITE_URL` 配置后 sitemap/canonical 绝对 URL 正确；未配置时降级不报错；浏览器 head 检查首页/kline/文章的 title、description、hreflang、OG