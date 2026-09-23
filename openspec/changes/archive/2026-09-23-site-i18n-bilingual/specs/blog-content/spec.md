# Spec Delta

## MODIFIED Requirements

### Requirement: 文章以独立 Markdown 文件存储

系统 SHALL 从 `content/posts/` 目录按当前 locale 读取博客文章，每篇每个语言一个 `.md` 文件，命名为 `{slug}.{locale}.md`（如 `echosync-hyperliquid-exchange.zh.md`、`echosync-hyperliquid-exchange.en.md`）。目录中的非 `.md` 文件 SHALL 被忽略。

#### Scenario: 识别文章文件

- **WHEN** `content/posts/` 中存在 `.md` 文件
- **THEN** 每个文件被解析为一篇文章，纳入对应语言的文章集合

#### Scenario: 按 locale 识别文章文件

- **WHEN** 当前 locale 为 `en` 且 `content/posts/` 含 `{slug}.en.md` 文件
- **THEN** 读取该语言文件并纳入英文文章集合

#### Scenario: 忽略非 Markdown 文件

- **WHEN** `content/posts/` 中存在非 `.md` 文件（如 `.DS_Store`、图片）
- **THEN** 该文件不被当作文章

### Requirement: frontmatter 元数据契约

每篇文章文件的 frontmatter SHALL 声明 `title`、`summary`、`date`、`tags`，其中 `title`、`summary` 为对应语言版本；`readMin`、`pinned` 为可选字段。缺少任一必填字段时，系统 SHALL 在加载阶段失败并给出指明文件与缺失字段的错误。

#### Scenario: 解析合法 frontmatter

- **WHEN** 文件包含全部必填字段
- **THEN** 文章元数据被正确解析，`tags` 为字符串数组，`date` 为 `yyyy-mm-dd`；`title`、`summary` 为该语言文案

#### Scenario: 解析英文版 frontmatter

- **WHEN** 读取 `{slug}.en.md` 且 frontmatter 完整
- **THEN** 元数据中的 `title`、`summary` 为英文文案

#### Scenario: 缺少必填字段

- **WHEN** 文件的 frontmatter 缺少 `title`、`summary`、`date` 或 `tags` 之一
- **THEN** 系统报错并指出出错的文件与缺失字段，不产出该文章

### Requirement: slug 与 URL 稳定

文章 slug SHALL 由文件名去除 `.md` 与 `.locale` 后缀决定（`{slug}.{locale}.md` → slug `{slug}`）。文章访问路径 SHALL 为 `/<locale>/blog/<slug>`，各 locale 下同一 slug 保持稳定。

#### Scenario: 由文件名推导 slug

- **WHEN** 存在文件 `content/posts/echosync-hyperliquid-exchange.zh.md`
- **THEN** 该文章的 slug 为 `echosync-hyperliquid-exchange`

#### Scenario: 按 locale 访问文章

- **WHEN** 用户访问 `/en/blog/echosync-hyperliquid-exchange`
- **THEN** 返回该 slug 的英文版文章

#### Scenario: 迁移后 URL 不变

- **WHEN** 用户访问 `/zh/blog/echosync-hyperliquid-exchange` 或 `/en/blog/echosync-hyperliquid-exchange`
- **THEN** 各自返回对应语言的同 slug 文章，URL 在各 locale 下稳定

### Requirement: Markdown 正文渲染

系统 SHALL 将文章正文的 Markdown 渲染为 HTML，并 SHALL 支持标题、段落、粗体、行内代码、围栏代码块、引用、有序/无序列表与 GFM 表格。渲染 SHALL 按当前 locale 使用对应语言文件。

#### Scenario: 含表格的文章

- **WHEN** 正文包含 GFM 表格语法
- **THEN** 渲染为带表头与数据行的 HTML 表格

#### Scenario: 含代码块的文章

- **WHEN** 正文包含围栏代码块
- **THEN** 渲染为 `<pre><code>` 结构，保留原始缩进与内容

#### Scenario: 按 locale 渲染正文

- **WHEN** 用户访问某 slug 的英文版
- **THEN** 以该语言文件的正文渲染内容

### Requirement: 列表与详情页行为不变

文章集合 SHALL 按日期倒序返回当前 locale 的文章。文章列表页 SHALL 展示该 locale 的标题、摘要、日期、阅读时长与标签；详情页 SHALL 渲染该 locale 的完整正文。

#### Scenario: 列表按日期倒序

- **WHEN** 访问某 locale 的博客列表页
- **THEN** 文章按 `date` 从新到旧排列

#### Scenario: 英文列表

- **WHEN** 访问 `/en/blog`
- **THEN** 列表展示英文标题与摘录（按日期倒序）

#### Scenario: 详情页渲染

- **WHEN** 访问某篇文章详情页
- **THEN** 页面展示其标题、元信息（日期、阅读时长）与完整正文（对应 locale）