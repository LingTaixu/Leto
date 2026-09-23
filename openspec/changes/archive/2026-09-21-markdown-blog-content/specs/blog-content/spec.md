# Spec Delta

## Purpose

用独立 Markdown 文件与 YAML frontmatter 管理博客文章，替代在代码中内嵌 HTML 字符串，并保持文章列表、详情页与现有 URL 的行为不变。

## ADDED Requirements

### Requirement: 文章以独立 Markdown 文件存储

系统 SHALL 从 `content/posts/` 目录读取博客文章，每篇文章对应一个 `.md` 文件。目录中的非 `.md` 文件 SHALL 被忽略。

#### Scenario: 识别文章文件

- **WHEN** `content/posts/` 中存在 `.md` 文件
- **THEN** 每个文件被解析为一篇文章，纳入文章集合

#### Scenario: 忽略非 Markdown 文件

- **WHEN** `content/posts/` 中存在非 `.md` 文件（如 `.DS_Store`、图片）
- **THEN** 该文件不被当作文章

### Requirement: frontmatter 元数据契约

每篇文章文件 SHALL 以 YAML frontmatter 开头，声明 `title`、`summary`、`date`、`tags` 字段；`readMin`、`pinned` 为可选字段。缺少任一必填字段时，系统 SHALL 在构建或加载阶段失败并给出指明文件与缺失字段的错误，而 SHALL NOT 静默产出不完整文章。

#### Scenario: 解析合法 frontmatter

- **WHEN** 文件包含全部必填字段
- **THEN** 文章元数据被正确解析，`tags` 为字符串数组，`date` 为 `yyyy-mm-dd`

#### Scenario: 缺少必填字段

- **WHEN** 文件的 frontmatter 缺少 `title`、`summary`、`date` 或 `tags` 之一
- **THEN** 系统报错并指出出错的文件与缺失字段，不产出该文章

### Requirement: slug 与 URL 稳定

文章 slug SHALL 由文件名（去除 `.md` 扩展名）决定。迁移后每篇文章的 slug SHALL 与其原有 slug 一致，使 `/blog/<slug>` 现有 URL 保持可用。

#### Scenario: 由文件名推导 slug

- **WHEN** 存在文件 `content/posts/echosync-hyperliquid-exchange.md`
- **THEN** 该文章的访问路径为 `/blog/echosync-hyperliquid-exchange`

#### Scenario: 迁移后 URL 不变

- **WHEN** 用户访问迁移前已存在的文章 URL
- **THEN** 页面正常返回该文章内容

### Requirement: Markdown 正文渲染

系统 SHALL 将文章正文的 Markdown 渲染为 HTML，并 SHALL 支持标题、段落、粗体、行内代码、围栏代码块、引用、有序/无序列表与 GFM 表格。渲染结果 SHALL 与迁移前的 HTML 呈现等价。

#### Scenario: 含表格的文章

- **WHEN** 正文包含 GFM 表格语法
- **THEN** 渲染为带表头与数据行的 HTML 表格

#### Scenario: 含代码块的文章

- **WHEN** 正文包含围栏代码块
- **THEN** 渲染为 `<pre><code>` 结构，保留原始缩进与内容

### Requirement: 列表与详情页行为不变

文章集合 SHALL 按日期倒序返回。文章列表页 SHALL 展示全部文章的标题、摘要、日期、阅读时长与标签；详情页 SHALL 渲染完整正文。上述行为 SHALL 与迁移前一致。

#### Scenario: 列表按日期倒序

- **WHEN** 访问博客列表页
- **THEN** 文章按 `date` 从新到旧排列

#### Scenario: 详情页渲染

- **WHEN** 访问某篇文章详情页
- **THEN** 页面展示其标题、元信息（日期、阅读时长）与完整正文
