# Tasks

## 1. i18n 骨架

- [x] 1.1 新建 `middleware.ts`：跳过 `_next`/favicon，`cookie.locale` 优先，按 `Accept-Language` 检测重定向无前缀请求，fallback `zh`，旧路径 `/blog/...` 等重定向 `/zh/...`；验证 `bun run build` 通过
- [x] 1.2 新建 `lib/i18n.ts`：`Locale = "zh" | "en" | (string & {})`，`messages/{en,zh}.json`（同构 key 树），`MessageProvider` 暴露 `t(key)`（类型安全）+ `locale` + `setLocale`（写 cookie 并 `router.replace('/{locale}'+path)`），缺失键回退 `zh`；验证 `bunx tsc --noEmit` 通过
- [x] 1.3 将 `app/layout.tsx` 迁至 `app/[locale]/layout.tsx`，校验 `locale`（非法 `notFound()`），用动态段参数供消息层；验证 `/zh`、`/en` 渲染

## 2. 文章双文件迁移与翻译

- [x] 2.1 `content/posts/` 现有 8 个 `{slug}.md` 重命名为 `{slug}.zh.md`；验证 8 个 `zh.md` 文件存在
- [x] 2.2 `lib/posts.ts` 重构：slug 由文件名去 `.locale` 后缀推导，`getPosts(locale)` 读该 locale 集合（按 date 倒序）、`getPostBySlug(slug, locale)`；验证 `bunx tsc --noEmit` 通过
- [x] 2.3 为 8 篇补充 `{slug}.en.md` 英文译（标题/摘要/正文；代码块与合约常量不译）；验证 16 个文件存在且 frontmatter 完整
- [x] 2.4 `[locale]/blog` 与 `[locale]/blog/[slug]` 按 locale 生成静态参数、渲染对应语言文章；验证 `/zh/blog/<slug>` 与 `/en/blog/<slug>` 均 200

## 3. UI 文案国际化

- [x] 3.1 导航与布局文案改 `t()`：`Navigate`、`TabBar`、`Footer`、`BackToTop`、`Breadcrumbs`、`layout`；验证中英切换后导航/页脚文字正确
- [x] 3.2 通用组件文案改 `t()`：`Button`、`Tag`、`Pagination`、`Skeleton`、`Prose`、`ArticleCard`（日期/阅读时长文案）；验证列表/骨架/分页双语
- [x] 3.3 加载与提示改 `t()`：`loading`、`not-found`、`CssPulse`、`BootSplash`；验证 404/加载文案双语
- [x] 3.4 Web3 功能文案改 `t()`：`app/web3/page`、`web3/notary`、`transfer`、`components/notary/*`（含错误/状态提示，`// 存证写入` 等注释式标题）；验证存证/转账页双语
- [x] 3.5 首页与关于页文案改 `t()`：`app/page`、`app/about`（简历 96 行、技能/工作/项目明细）；验证 `/zh`、`/en` 首页与关于页内容切换

## 4. 验证

- [x] 4.1 运行 `bun run lint` 与 `bunx tsc --noEmit` 无错误
- [x] 4.2 运行 `bun run build` 成功，`/[locale]` 全路由生成，无 `window is not defined`
- [ ] 4.3 手动验证：系统语言英文访问 `/` 重定向 `/en`；切中文写 cookie 后刷新仍为中文；`/en/blog/<slug>` 展示英文文章；旧 `/blog/<slug>` 重定向至 `/zh/blog/<slug>`；切换器导航正确