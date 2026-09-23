# Design

## Context

- 现状：`lib/posts.ts` 内 7 篇文章以 `content: string`（HTML）硬编码；`app/blog/[slug]/page.tsx` 用 `getPostBySlug` 取数，`components/Prose.tsx` 通过 `dangerouslySetInnerHTML` 渲染该 HTML。
- `Article` 类型字段：`slug`、`title`、`summary`、`date`、`readMin`、`tags`、`pinned?`、`content?`。
- 正文实际用到的元素：`h2/h3`、`p`、`strong`、行内 `code`、`pre/code`、`table/thead/tbody/tr/th/td`、`ul/li`、`blockquote`——均为 Markdown/GFM 可表达。
- 项目为 Next.js 16 App Router，`app/blog/*` 均为 Server Component，可用 Node `fs`。未安装任何 Markdown 相关依赖，无 RSS/sitemap。
- 页面可观察行为不变（见 proposal.md 的 Non-goals 与 specs）。

## Goals / Non-Goals

**Goals:**
- 内容与代码分离：每篇文章一个 `content/posts/<slug>.md`，frontmatter 承载元数据。
- 对外 API（`getPosts` / `getPostBySlug`）与 `Prose` 组件保持不变，页面零改动。
- 7 篇迁移后 slug/URL 不变，渲染结果与现状等价。

**Non-Goals:**
- 不引入代码语法高亮、标题锚点、自动 `readMin`。
- 不改动视觉排版、URL 结构、RSS/sitemap。
- 不做增量构建 / 热更新内容监听。

## Decisions

### D1. 渲染管线：`gray-matter` + `unified/remark`

```
.md 文件
  │ gray-matter            → { data: frontmatter, content: markdown }
  │ unified()
  │   .use(remark-parse)
  │   .use(remark-gfm)     → GFM 表格 / 删除线 / 任务列表
  │   .use(remark-rehype)
  │   .use(rehype-stringify)
  ▼
HTML 字符串 → 现有 Prose(html) 组件（不变）
```

- 理由：GFM 表格是硬需求；`unified` 生态成熟，后续要加高亮/锚点只需插入 rehype 插件；输出 HTML 字符串与现有 `Prose` 接口完全兼容。
- 备选：`marked`（仅 2 个依赖，更轻，内置 GFM）——够用但扩展性弱；`@next/mdx`（可在正文嵌 React 组件）——需改动渲染方式，对纯内容博客过重。取 unified。

### D2. slug 由文件名决定

`content/posts/echosync-hyperliquid-exchange.md` → slug `echosync-hyperliquid-exchange`。文件名与现有 slug 一一对应，保证 URL 不变。不在 frontmatter 冗余 `slug` 字段。

### D3. `readMin` 保留在 frontmatter

保持与现状等价，不做自动计算（自动计算会改变现有显示值，属行为变更）。

### D4. 内容目录 `content/posts/`

内容与代码分离，位于仓库根；`lib/posts.ts` 用 `path.join(process.cwd(), "content/posts")` 读取。

### D5. 读取与缓存

Server 端同步读取目录；在模块级做一次读取结果的 memo 缓存，避免同一构建/请求内重复读盘。`getPosts()` 仍按 `date` 倒序返回。

### D6. frontmatter 校验：手写、fail fast

解析后校验 `title`、`summary`、`date`、`tags` 存在且类型正确（`tags` 为字符串数组）；缺失即抛出含文件路径与字段名的错误。不引入 zod，避免额外依赖；构建期失败能让内容错误尽早暴露。

### D7. 迁移方式：`turndown` 初转 + 人工校对

用 `turndown`（含 GFM 插件）把现有 HTML 批量转 Markdown 作为初稿，再逐篇校对表格对齐、代码块缩进与引用；`turndown` 仅作为一次性开发依赖，不进入运行时。

### D8. `Prose` 与页面不动

Markdown 渲染产出的 HTML 元素（`h2`、`p`、`pre>code`、`table` 等）与现有 `Prose` 的后代选择器匹配，无需改样式。

## Risks / Trade-offs

- [HTML→MD 保真度] 表格单元格内的 `<strong>`、代码块缩进、行内 HTML 可能在转换中失真 → turndown 初转后逐篇对照原 HTML 校对，用迁移前后页面视觉对比兜底。
- [URL 失效] 文件名与旧 slug 不一致会导致外链 404 → 迁移时以现有 slug 命名文件，并加验证任务逐条检查 7 个 URL。
- [Node 运行时依赖] `fs` 仅能在 Server 环境使用 → 读取逻辑只放 `lib/posts.ts`，仅被 Server Component 引用；不引入 client/edge 用法。
- [`date` 解析歧义] YAML 会把 `2026-03-10` 解析为 Date 对象 → 统一转为 `yyyy-mm-dd` 字符串，保持现有 `formatDate` 行为。
- [构建期抛错] frontmatter 校验失败会中断构建 → 这是期望行为（fail fast），错误信息需指明文件与字段以便修复。

## Migration Plan

1. 安装依赖（`gray-matter`、`unified` 管线；`turndown` 为开发期一次性使用）。
2. 创建 `content/posts/`，用 turndown 将 7 篇 HTML 转 Markdown，补 frontmatter，文件名对齐旧 slug。
3. 改写 `lib/posts.ts` 内部实现，保持导出 API 不变。
4. 本地 `build` + 逐篇 URL/渲染对比，确认等价后合入。
- 回滚：`lib/posts.ts` 与 `content/posts/` 均为本次新增/改写，回退提交即可恢复内嵌 HTML 版本。

## Open Questions

无（关键决策已定；高亮等增强明确列为 Non-goals，留待后续独立变更）。
