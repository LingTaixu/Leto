# Spec Delta

## MODIFIED Requirements

### Requirement: slug 与 URL 稳定

文章 slug SHALL 由文件名去除 `.md` 与 `.locale` 后缀决定（`{slug}.{locale}.md` → slug `{slug}`）。文章 SHALL NOT 再拥有独立路由页面；文章访问路径 SHALL 为桌面深链 `/<locale>?app=blog&slug=<slug>`。旧路由 `/<locale>/blog/<slug>` SHALL 重定向到对应深链，各 locale 下同一 slug 保持稳定。

#### Scenario: 由文件名推导 slug

- **WHEN** 存在文件 `content/posts/echosync-hyperliquid-exchange.zh.md`
- **THEN** 该文章的 slug 为 `echosync-hyperliquid-exchange`

#### Scenario: 按 locale 访问文章

- **WHEN** 用户访问 `/en?app=blog&slug=echosync-hyperliquid-exchange`
- **THEN** 桌面打开博客窗口并展示该 slug 的英文版文章

#### Scenario: 迁移后 URL 不变

- **WHEN** 用户访问旧 URL `/zh/blog/echosync-hyperliquid-exchange` 或 `/en/blog/echosync-hyperliquid-exchange`
- **THEN** 分别重定向到 `/zh?app=blog&slug=echosync-hyperliquid-exchange` 与 `/en?app=blog&slug=echosync-hyperliquid-exchange`，同 slug 文章在各 locale 下稳定可达

### Requirement: 列表与详情页行为不变

文章集合 SHALL 按日期倒序返回当前 locale 的文章。博客窗口的列表视图 SHALL 展示该 locale 的标题、摘要、日期、阅读时长与标签；详情视图 SHALL 渲染该 locale 的完整正文。列表与详情 SHALL 支持窗口内双向导航（点进详情、返回列表保持分页位置），并提供分页。

#### Scenario: 列表按日期倒序

- **WHEN** 用户打开博客窗口
- **THEN** 文章按 `date` 从新到旧排列

#### Scenario: 英文列表

- **WHEN** 当前 locale 为 `en` 且打开博客窗口
- **THEN** 列表展示英文标题与摘录（按日期倒序）

#### Scenario: 详情页渲染

- **WHEN** 用户在博客窗口中点开某篇文章
- **THEN** 窗口内展示其标题、元信息（日期、阅读时长）与完整正文（对应 locale）

#### Scenario: 详情返回列表

- **WHEN** 用户在文章详情视图点击返回
- **THEN** 回到博客列表视图，保持之前的分页位置
