# Tasks

## 1. 依赖与内容骨架

- [x] 1.1 安装运行时依赖 `gray-matter` 与 `unified` 管线（`remark-parse`、`remark-gfm`、`remark-rehype`、`rehype-stringify`）；验证 `package.json` 的 `dependencies` 已记录且 `node_modules` 可解析
- [x] 1.2 安装开发期一次性依赖 `turndown` + `turndown-plugin-gfm`；验证 `package.json` 的 `devDependencies` 已记录
- [x] 1.3 创建 `content/posts/` 目录；验证目录存在

## 2. 内容迁移（7 篇）

- [x] 2.1 编写一次性转换脚本，用 turndown 将 `lib/posts.ts` 中 7 篇 HTML `content` 转为 Markdown 初稿；验证生成 7 个 `.md` 文件
- [x] 2.2 为每篇补 YAML frontmatter（`title`、`summary`、`date`、`tags`、`readMin`，`pinned` 按需），文件名对齐旧 slug；验证文件名集合与旧 slug 列表（7 个）完全一致
- [x] 2.3 逐篇校对表格对齐、代码块缩进与语言标注、引用与行内代码，对照原 HTML 修正；验证每篇的表格/代码块/引用元素与迁移前一一对应

## 3. lib/posts.ts 改写

- [x] 3.1 实现目录读取与 `gray-matter` 解析，并校验 frontmatter 必填字段（`title`/`summary`/`date`/`tags`），缺失时抛出含文件路径与字段名的错误；验证删除某篇 frontmatter 的 `title` 后报错信息正确
- [x] 3.2 实现 Markdown → HTML 渲染管线（含 `remark-gfm`），`date` 统一转为 `yyyy-mm-dd` 字符串；验证含表格与代码块的文章输出正确 HTML
- [x] 3.3 保持 `getPosts()`（按 `date` 倒序）与 `getPostBySlug()`（按 slug 查找）签名与行为不变，`Article` 类型不变；验证 `bunx tsc --noEmit` 通过
- [x] 3.4 移除 `lib/posts.ts` 中内嵌的 HTML `content` 字符串；验证文件中不再残留文章 HTML

## 4. 验证

- [x] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 4.2 运行 `bun run build` 成功，`generateStaticParams` 覆盖 7 篇文章；验证构建产物包含全部 `/blog/<slug>` 路由
- [x] 4.3 逐条访问 7 个迁移前的文章 URL，确认均返回 200 且正文非空；验证无 404
- [x] 4.4 迁移前后视觉对比：博客列表页 + 至少 2 篇含表格/代码块的详情页，确认排版与迁移前一致
