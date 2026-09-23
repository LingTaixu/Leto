# seo Specification

## Purpose

为站点提供全站 SEO 能力：sitemap 与 robots 产出、逐页 metadata、多语言 hreflang 与 canonical，使搜索引擎可发现并正确索引 zh/en 双版本内容。

## Requirements

### Requirement: 站点地图与 robots

系统 SHALL 提供 `sitemap`（`app/sitemap.ts`）覆盖全部静态路由与文章 URL（`zh`、`en` 两个 locale 全量），并 SHALL 提供 `robots` 允许全部路径抓取且回指 sitemap；sitemap 与 canonical 的绝对 URL SHALL 基于配置的站点地址（`NEXT_PUBLIC_SITE_URL`）。

#### Scenario: sitemap 覆盖双语全量

- **WHEN** 访问 `/sitemap.xml`
- **THEN** 返回含 `/zh`、`/en` 静态页与全部文章 URL 的条目

#### Scenario: robots 允许抓取

- **WHEN** 访问 `/robots.txt`
- **THEN** 声明允许抓取全部路径并给出 sitemap 地址

### Requirement: 逐页 metadata

每个可访问页面 SHALL 提供非空 `title` 与 `description`；根 layout SHALL 提供 `metadataBase`、`openGraph` 与 `twitter` 卡片；双语文案 SHALL 来自 zh/en 消息文件。

#### Scenario: 页面 title/description

- **WHEN** 访问任一页面（如首页、about、kline）
- **THEN** HTML head 含该页 title 与 description

#### Scenario: 根 metadata 补强

- **WHEN** 任一页面渲染
- **THEN** head 含 metadataBase、openGraph、twitter 元素

### Requirement: 多语言 hreflang 与 canonical

`zh` 版页面 SHALL 输出指向自身的 `canonical`，以及 `zh`、`en` 与 `x-default`（指向 `zh`）的 `hreflang` alternates；`en` 版对称。

#### Scenario: zh 页面 hreflang

- **WHEN** 访问 `/zh/blog`
- **THEN** head 含 `/zh/blog` canonical 与 `zh`/`en`/`x-default` hreflang

#### Scenario: en 页面 hreflang

- **WHEN** 访问 `/en/blog`
- **THEN** head 含 `/en/blog` canonical 与对称 hreflang