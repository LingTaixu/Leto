# Spec Delta

## MODIFIED Requirements

### Requirement: 站点地图与 robots

系统 SHALL 提供 `sitemap`（`app/sitemap.ts`），条目收缩为两个桌面入口 URL（`/zh`、`/en`），SHALL NOT 再包含文章与子功能路由；并 SHALL 提供 `robots` 允许全部路径抓取且回指 sitemap；sitemap 与 canonical 的绝对 URL SHALL 基于配置的站点地址（`NEXT_PUBLIC_SITE_URL`）。

#### Scenario: sitemap 覆盖双语全量

- **WHEN** 访问 `/sitemap.xml`
- **THEN** 返回覆盖 zh、en 双语的条目，且仅含 `/zh`、`/en` 两个桌面入口 URL（不再含文章与子路由）

#### Scenario: robots 允许抓取

- **WHEN** 访问 `/robots.txt`
- **THEN** 声明允许抓取全部路径并给出 sitemap 地址

### Requirement: 逐页 metadata

每个可访问路由（桌面入口 `/zh`、`/en` 及重定向路由）SHALL 提供非空 `title` 与 `description`；根 layout SHALL 提供 `metadataBase`、`openGraph` 与 `twitter` 卡片；双语文案 SHALL 来自 zh/en 消息文件。

#### Scenario: 页面 title/description

- **WHEN** 访问任一可访问页面（桌面入口 `/zh`、`/en`）
- **THEN** HTML head 含该 locale 的桌面入口 title 与 description

#### Scenario: 根 metadata 补强

- **WHEN** 任一页面渲染
- **THEN** head 含 metadataBase、openGraph、twitter 元素

### Requirement: 多语言 hreflang 与 canonical

`zh` 桌面入口 SHALL 输出指向自身的 `canonical`，以及 `zh`、`en` 与 `x-default`（指向 `zh`）的 `hreflang` alternates；`en` 入口对称。hreflang/canonical SHALL NOT 再为文章或子功能路由输出。

#### Scenario: zh 页面 hreflang

- **WHEN** 访问 `/zh`
- **THEN** head 含 `/zh` canonical 与 `zh`/`en`/`x-default` hreflang

#### Scenario: en 页面 hreflang

- **WHEN** 访问 `/en`
- **THEN** head 含 `/en` canonical 与对称 hreflang
