# Proposal

## Why

站点目前全中文且无 locale 路由，无法服务英文用户。加入 Next.js 官方 i18n（`[locale]` 段 + middleware），按用户系统语言自动切换中英，并为其他语言预留接口。UI 文案、功能文案与博客文章正文（8 篇）全部双语。

## What Changes

- 全站加入 `[locale]` 动态段（`/zh/…`、`/en/…`），`middleware` 按 `Accept-Language` 重定向无前缀请求，`cookie` 记住手动选择（优先于系统语言），无法识别时 fallback `zh`。
- 资源路径（`/_next`、`/favicon` 等）与 API 绕过 locale 路由。
- 新增 `messages/{en,zh}.json`、`i18n` 消息层（类型安全），25 个含中文文案文件改为 `t()` 调用。
- 语言类型为开放联合（`"zh" | "en" | (string & {})`），未来加 `/ja` 仅需补翻译文件与消息文件。
- 博客文章改为按 locale 存储：`content/posts/{slug}.{locale}.md`（`zh.md`/`en.md`），现有 8 篇 `.md` 迁移为 `.zh.md`，补充 8 篇英文翻译；`lib/posts.ts` 重构为按 `(slug, locale)` 读取，`getPosts(locale)` 按语言返回。
- 新增 locale 切换器组件（UI 中切换，写 cookie）。
- **Breaking**：文章 URL 从 `/blog/<slug>` 变为 `/[locale]/blog/<slug>`；文章文件命名变更。

## Capabilities

### New Capabilities

- `i18n`: 站点国际化——locale 路由与 middleware 检测、消息文件（en/zh）、cookie 切换器、多语言接口预留（`Locale` 开放联合）。

### Modified Capabilities

- `blog-content`: 文章存储与读取改为按 locale——`{slug}.{locale}.md` 文件组织、`getPosts(locale)`/按 locale 取文章、URL 从 `/blog/<slug>` 变更为 `/<locale>/blog/<slug>`。

## Impact

- 代码：`app/[locale]/*`（全站路由迁移）、`middleware.ts`（新增）、`lib/i18n.ts`（新增）、`messages/*.json`（新增）、`components/*` 文案提取、`lib/posts.ts`（重构）、`content/posts/*`（16 文件）。
- 依赖：文案消息层用轻量自建（无新增 runtime 依赖）。
- 兼容性：现有 `/blog/<slug>` 等 URL 失效（Breaking），改由 middleware 重定向到 `/zh/blog/<slug>` 兜底。
- 数据：8 篇文章的 `zh.md` 由现有内容迁移，`en.md` 为新译。