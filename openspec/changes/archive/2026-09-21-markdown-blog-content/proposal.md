# Proposal

## Why

博客正文目前以 HTML 字符串硬编码在 `lib/posts.ts` 中：7 篇文章混在 429 行的 TS 文件里，元数据与正文交织，编辑体验差、易漏改，且无法使用标准 Markdown 工具链。改为每篇一个 Markdown 文件 + YAML frontmatter，让内容与代码分离、格式可校验、正文可读可维护。

## What Changes

- 新增 `content/posts/*.md`：每篇文章一个文件，YAML frontmatter 承载元数据，正文为 Markdown（GFM，含表格 / 代码块 / 引用 / 列表）。
- 定义 frontmatter 契约：`title`、`summary`、`date`、`tags` 必填；`readMin`、`pinned` 可选。
- `lib/posts.ts` 改为读取 `content/posts/` 目录、解析 frontmatter、将 Markdown 渲染为 HTML；对外 API `getPosts()` / `getPostBySlug()` 签名保持不变。
- 将现有 7 篇文章从 HTML 迁移为 Markdown，**slug 与现有 URL 保持不变**。
- `components/Prose.tsx` 与页面组件保持不变。
- 新增 Markdown 解析依赖（`gray-matter` + 渲染管线）。
- **Non-goals**：本次为等价迁移，不引入代码语法高亮、不改变视觉排版、不改动文章 URL、不新增 RSS/sitemap。

## Capabilities

### New Capabilities

- `blog-content`: 博客文章的内容来源、frontmatter 元数据契约、slug 规则与 Markdown 渲染行为。

### Modified Capabilities

<!-- 无现有 spec 的需求被修改（notary-page 不受影响） -->

## Impact

- 代码：`lib/posts.ts`（内部实现改写）、`content/posts/*.md`（新增 7 篇）、`app/blog/[slug]/page.tsx`（`generateStaticParams` 数据源改为目录遍历）、`app/blog/page.tsx`（经 `getPosts()` 间接受益，签名不变）。
- 依赖：新增 `gray-matter` 与 Markdown → HTML 渲染管线。
- 数据/兼容性：现有 7 个文章 URL 必须保持可用；页面渲染结果与现状等价。
- 移除：`lib/posts.ts` 中内嵌的 HTML `content` 字符串。
