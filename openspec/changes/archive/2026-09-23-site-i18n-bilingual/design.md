# Design

## Context

- 现状：全站中文无 locale 路由；25 个文件含中文硬编码文案；8 篇文章 `content/posts/{slug}.md`，slug 由文件名推导，URL `/blog/<slug>`。
- App Router 官方 i18n 能力：`[locale]` 动态段 + `middleware`（`Accept-Language` 检测、重定向）+ 无固定消息层。
- 项目用 `bun` + Next 16，`@/*` 别名，已有 `lib/posts.ts`（gray-matter + unified 渲染）、组件均为中文文案。
- 现有 `blog-content` spec：文件 `{slug}.md`、slug=文件名、`.md` 单语。

## Goals / Non-Goals

**Goals:**
- 全站 `[locale]`（`/zh`、`/en`），middleware 按 Accept-Language 检测 + cookie 优先 + fallback zh。
- UI/功能/正文双语；8 篇文章 `{slug}.{locale}.md` 双文件。
- `Locale` 开放联合，未来语言仅补翻译。
- 轻量消息层（零新增 runtime 依赖）。

**Non-Goals:**
- 不引入 `next-intl`/`i18next` 等库（用自建类型安全消息层）。
- 不做 SEO hreflang 优化（可后续）。
- 不翻译代码块内容、合约 ABI 常量等非文案。
- 不改动 Markdown 渲染管线本身。

## Decisions

### D1. 路由与 middleware

```
app/[locale]/...
├── layout.tsx            (读 cookie/set 默认, 校验 locale)
├── page.tsx              /[locale]
├── blog/page.tsx         /[locale]/blog
├── blog/[slug]/page.tsx  /[locale]/blog/<slug>
└── web3/...              /[locale]/web3/...

middleware.ts
  ├─ 静态资源(/ _next, /favicon.ico) → next()
  ├─ 已有 /zh|/en 前缀 → next()
  ├─ 有 cookie locale → redirect /{cookie}...
  ├─ 无前缀 → Accept-Language → redirect /{best match}...  (fallback zh)
  └─ 旧 URL (/blog/...) 无 locale → redirect /zh/...
```

- 用 `middleware.ts`（Node middleware）做重定向；`[locale]` 段参数校验在 layout 中完成（非法 locale → `notFound()`）。
- locale 值同时暴露给客户端（通过 React context）供 t() 与切换器使用。

### D2. 轻量消息层（类型安全，零依赖）

```
messages/en.json / messages/zh.json  (同构 key 树)
lib/i18n.ts
  - 类型: Messages = typeof en
  - MessageProvider( React context, 提供 t(key) + locale + setLocale )
  - 深层 key 类型: t('nav.home') 编译期校验
  - 切 locale 时用 useRouter 推 /{locale}{pathname}
```

- `zh` 作为默认/fallback 消息；`en` 缺失键回退 `zh`。
- 不用 `next-intl`：本项目文案靠 `t()` + 静态 json 足够，避免额外依赖与 getRequestConfig 复杂度。

### D3. 配置文件按 locale（blogs）

```
content/posts/{slug}.{locale}.md
  echosync-hyperliquid-exchange.zh.md   ← 迁移现有
  echosync-hyperliquid-exchange.en.md   ← 新英文译

lib/posts.ts
  - slug = filename 去掉 .md 与 .{locale}
  - getPosts(locale): 读该 locale 的 *.{locale}.md 集合，按 date 倒序
  - getPostBySlug(slug, locale)
  - posts/ 目录每个 slug 必须有该 locale 文件，否则该 locale 缺失(列表跳过/报错)
```

- 现有 `{slug}.md` 统一重命名为 `{slug}.zh.md`（git mv）；`blog-content` spec 的"slug 由文件名决定"相应改。
- `[locale]/blog/[slug]` 的 `generateStaticParams` 按语言生成参数。

### D4. cookie 切换器与优先级

```
优先级: cookie(手动选择) > Accept-Language > fallback(zh)
- 切换器 set cookie {locale}, 再 router.replace('/{locale}'+path)
- cookie 有效期: 'session'（本次会话记住；跨会话仍按系统语言）
```

- 切换写 `document.cookie`（或 server 端读 `cookies()`）——在 middleware 中读取。

### D5. 多语言接口预留

```
type Locale = "zh" | "en" | (string & {});
- 支持列表: ['zh', 'en']（middleware 校验用）
- 消息层泛化: 新增语言 = messages/{locale}.json + 支持列表追加
```

### D6. 旧 URL 兼容

`middleware` 对无 locale 的旧路径（`/blog/...`、`/about` 等）统一 redirect `/zh/...`，保留外链可用（Breaking 从新 URL 规范看，旧链接仍可达）。

### D7. 英文翻译节奏

- 8 篇 `en.md` 由人工（或本次一次导入）产出，`t()/消息` 的 UI 文案一定双份。
- 翻译保真：英文正文语义一致，frontmatter 标题/摘要英文。

## Risks / Trade-offs

- [文案量大（25 文件）] → 分批提取 `t()`，先核心导航/页面骨架，再 web3 功能，最后 about 简历。
- [8 篇正文翻译工作量] → tasks 分成中英文件迁移 + en 翻译两项，翻译为人工或后续补齐（`en` 缺失时列表按 `<slug>` 保留中文条目降级）。
- [旧 URL breaking] → middleware 重定向兜底缓解。
- [自建消息层较简单，无 next-intl 生态] → 本项目 UI 文案规模小，自建够用；可迁移时保留 t() 接口。
- [locale 文件缺失某语言] → 空列表/该 slug 该语言不可用；列表策略为按支持的 locale 提供。

## Migration Plan

1. 建 `[locale]` 骨架 + middleware + `lib/i18n` + `messages`。
2. `content/posts` 迁移为 `{slug}.zh.md`，新增 `{slug}.en.md`（英文译）。
3. 全站组件/页面文案改 `t()`（分批）。
4. 更新 `[locale]` 下所有路由与 `generateStaticParams`。
5. 旧 URL middleware 重定向。
6. 回滚：移除 `[locale]` 结构与 middleware，恢复无前缀路由需还原文案。

## Open Questions

无（决策已确认：双语文件、cookie 优先、/zh /en、预留语言接口、正文双译）。