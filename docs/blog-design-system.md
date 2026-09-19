# 个人博客设计系统规范

> **项目**：leto · Next.js 16 + Tailwind CSS 4 + React 19
> **气质**：极简瑞士风（Minimal Swiss）+ 卡片炫技（Neo-Glow）
> **移动端导航**：iOS 液体玻璃胶囊 Tab Bar（Liquid Glass）
> **内容**：技术笔记为主 · **兼容**：移动端优先
> **主题**：跟随系统 `prefers-color-scheme` 自动切换

---

## 1. 设计原则

| 原则 | 说明 |
|---|---|
| **排版即设计** | 无装饰色块，靠字号、行高、留白建立层级 |
| **强调色克制** | 全局唯一强调色 `accent`，用于链接、代码高亮、激活态、卡片辉光 |
| **朴素 chrome · 卡片炫技** | Header/Footer/正文保持克制，「文章卡片」是唯一设计表达位（辉光/渐变），反差越大越酷 |
| **主题跟随系统** | 不设手动开关，`prefers-color-scheme` 全程接管亮/暗切换，SSR 无闪烁 |
| **内容优先** | 阅读宽度 ≤ 68ch，正文不左对齐到 100% 视口 |
| **移动端为基线** | 先按 375px 设计，再向上增强（desktop-first 不做） |
| **可访问性内置** | 所有组件满足 WCAG AA，focus 可见，支持键盘 |

---

## 2. Design Tokens

### 2.1 色彩

基于 `Monochrome + Blue Accent` 方案。**亮色为默认，暗色随 `prefers-color-scheme` 自动切换。**

```css
/* 亮色 (default / light) */
--bg:        #FAFAFA;   /* 页面背景  */
--surface:   #FFFFFF;   /* 卡片/表头  */
--border:    #E4E4E7;   /* 分隔线  */
--text:      #18181B;   /* 正文  */
--text-muted:#52525B;   /* 次要文字  */
--text-faint:#A1A1AA;   /* 注释/时间戳  */
--accent:    #2563EB;   /* 链接/激活  */
--accent-hover: #1D4ED8;/* 强调态  */
--on-accent: #FFFFFF;   /* 强调背景上的文字  */

/* 暗色 (prefers-color-scheme: dark) */
--bg:        #09090B;
--surface:   #18181B;
--border:    #27272A;
--text:      #FAFAFA;
--text-muted:#A1A1AA;
--text-faint:#71717A;
--accent:    #60A5FA;   /* 暗色下提亮一档保证对比  */
--accent-hover: #93C5FD;
--on-accent: #0F172A;

/* 功能性 */
--success: #16A34A;
--warning: #D97706;
--error:   #DC2626;
```

**对比度约定（WCAG AA）**：
- `text` on `bg` / `surface`：≥ 7:1 ✅
- `text-muted` on `bg`：≥ 4.5:1 ✅
- `accent` (链接) on `bg`：≥ 4.5:1 ✅
- 暗色下 `accent #60A5FA` on `#09090B`：≈ 7.6:1 ✅

### 2.2 字体

**双字体策略**：正文用 Inter（瑞士风基准），代码用 JetBrains Mono。

```css
--font-sans:  "Inter", -apple-system, "Segoe UI", "PingFang SC",
              "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
--font-mono:  "JetBrains Mono", ui-monospace, "SFMono-Regular",
              Menlo, Consolas, monospace;
```

> 中文字形缓释：中文无需单独字体，跟随系统默认中文字体；`-webkit-font-smoothing` 开启，行高适配中文（中文建议 line-height ≥ 1.75）。

### 2.3 字号与行高（Type Scale）

移动端 `320–374px` 与 `≥ 375px` 两档，采用 modular scale ≈ 1.25。

| Token | 移动端 | ≥375px / md 及以上 | 行高 | 字重 | 用途 |
|---|---|---|---|---|---|
| `text-xs` | 12px | 12px | 1.5 | 400 | 代码标签、页脚 |
| `text-sm` | 13px | 14px | 1.6 | 400 | 时间戳、说明 |
| `text-base` | **15px** | **16px** | 1.75 | 400 | 正文（阅读） |
| `text-lg` | 16px | 18px | 1.6 | 500 | 卡片标题 |
| `text-xl` | 18px | 20px | 1.5 | 600 | 小标题 h3 |
| `text-2xl` | 20px | 24px | 1.4 | 700 | 区块标题 h2 |
| `text-3xl` | 24px | 30px | 1.3 | 700 | 文章标题 h1 |
| `text-4xl` | 30px | 38px | 1.25 | 700 | 站点 Hero（首页） |

> 汉字超过 30px 时无需再放大，文章标题移动端用 26px 视觉平衡。

### 2.4 间距（Spacing Scale）

4px 基数，Tailwind 默认即符合：

```
0 · 1(4) · 2(8) · 3(12) · 4(16) · 5(20) · 6(24) · 8(32) · 10(40) · 12(48) · 16(64) · 20(80) · 24(96)
```

**栅格与页面容器**：

| 断点 | 容器宽 | padding |
|---|---|---|
| < 480px | — | 20px 内侧 |
| ≥ 640px (sm) | max-w-xl | 24px |
| ≥ 1024px (lg) | max-w-3xl (768px) | 32px |
| 正文区 | **max-w-[68ch]** | 居中 |

页头/页脚与内容同宽对齐，文章列表与文章阅读宽度一致（68ch），**不**采用窄正文 + 宽列表的双栏。

### 2.5 圆角 & 阴影

| Token | 值 | 用途 |
|---|---|---|
| `rounded-none` | 0 | 代码块、输入框（编辑器感） |
| `rounded-md` | 6px | 按钮、标签、卡片 |
| `rounded-lg` | 8px | 文章卡片（可选） |
| `shadow-sm` | `0 1px 2px rgb(0 0 0 / 0.05)` | 低层浮层 |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1)` | 移动端底部栏提升 |
| `glow-sm` | `0 12px 40px -12px var(--glow)` | 卡片 hover 辉光 |
| `glow-lg` | `0 20px 56px -16px var(--glow)` | Hero / 主卡片 hover |

`--glow` 按主题定义：亮色 `rgb(37 99 235 / 0.18)`，暗色 `rgb(96 165 250 / 0.30)`（暗色更强）。

> 页面 chrome 少用阴影，层级靠 border + 间距；**辉光保留给文章卡片**——它是炫技位。

### 2.6 动效（Motion）

| 场景 | 时长 | 缓动 |
|---|---|---|
| hover（链接/按钮/卡片） | 150ms | ease-out |
| focus ring 出现 | 0ms + box-shadow | 立即 |
| 页面淡入（可选） | 300ms | ease-out |
| 移动端导航展开 | 250ms | cubic-bezier(0.16,1,0.3,1) |
| 代码块吸顶 | 200ms | ease-in-out |
| **Liquid Glass Tab 切换** | 300ms | `cubic-bezier(0.22, 1, 0.36, 1)`（expressive ease） |
| **Liquid Glass 指示条滑动** | 250ms | spring：`stiffness 320, damping 30` |
| **Liquid Glass 入场/裁剪** | 200ms | ease-out |

`prefers-reduced-motion: reduce` 时必须禁用所有动画。

### 2.7 Liquid Glass 玻璃 Token（移动端导航专用）

```css
/* 玻璃背景（三层合成：模糊底 + 半透明 + 上缘高光） */
--glass-bg: rgba(255, 255, 255, 0.55);          /* 亮色  */
--glass-bg-dark: rgba(24, 24, 27, 0.55);        /* 暗色  */
--glass-blur: saturate(180%) blur(28px);         /* backdrop-filter */
--glass-highlight: linear-gradient(180deg, rgba(255,255,255,0.55), transparent);
/* 玻璃上缘楞线 */
--glass-border: rgba(255, 255, 255, 0.28);       /* 亮色描边 */
--glass-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255,255,255,0.35);
--glass-indicator: rgba(255, 255, 255, 0.85);     /* 亮色指示条 */
```

| 用途 | 建议值（亮/暗） |
|---|---|
| 背景玻璃 | `--glass-bg` / `--glass-bg-dark`（半透明必须，否则 blur 无意义） |
| 上缘高光 | `::before` 满宽 1–2px，`--glass-highlight` |
| 外描边 | 1px `border: color-mix(in srgb, var(--glass-border) 60%, transparent)` |
| 悬浮 | `--glass-shadow`（外投影 + 内部高光双份） |
| active 指示条 | `--glass-indicator` backdrop + `accent` 文字 |

> **暗色优化**：暗色下 glass 底不宜全黑——保留 55% 通报窗口，让背景色仍然「透」出来，这是 Liquid Glass 与扁平暗色主题的本质区别。`saturate(180%)` 让背后色彩更鲜艳（折射感）。

### 3.1 顶层布局

```
┌──────────────── Header ───────────────┐
│  ◖ 品牌名(链接/)     导航(桌面≥lg) │
├───────────────────────────────────────┤
│              main 内容                │
│              (底部留白,防遮档)        │
├───────────────────────────────────────┤
│      ┌──── Liquid Glass ────┐        │
│      │  ⌂    🏷    ✍    ⚙    │ ← 移动端│
│      └────── 胶囊 Tab ──────┘         │
└───────────────────────────────────────┘
```

- **Header（桌面 ≥lg）**：sticky top，`h-14` (56px)，`bg` + `backdrop-blur`，底部 1px `border`。品牌名在左，导航链接在右（Home / Blog / Tags / About）。
- **移动端 Header**：**隐藏完整 Header 导航**，只保留顶部品牌名一行（同宽、sticky、玻璃底），导航主体交给**底部 Liquid Glass 胶囊 Tab**。
- **Footer**：简单两行，不做大块堆叠。

### 3.1.1 移动端导航（Liquid Glass 胶囊 Tab）⭐ 唯一动画位

仿 iOS 26 Liquid Glass，移动端主导航为一枚**悬浮底部胶囊玻璃条**：

```
           safe-area-inset-bottom 自适应
    ┌──────────────────────────────────────┐
    │   ⌂首页   🏷标签   ✍关于              │  ← bg-glass-blur 胶囊
    │   ▁▂▃▄▅▆▇ 指示条（accent，滑动）      │  ← 液体滑动指示器
    └──────────────────────────────────────┘
    ↑ fixed bottom + 玻璃浮层 + 1px 高光边
```

**结构**：`<nav aria-label="主导航">` → 按钮组（每个 tab 一个 `<button>` 或 `<Link>`）。

**容器**：`fixed bottom-4 inset-x-4`（或 `bottom: max(1rem, env(safe-area-inset-bottom))`），`mx-auto max-w-sm`，`h-16`，`rounded-full`（胶囊），`bg-glass`（见 token 2.7）。

**液体玻璃材质层（3 层合成）**：
| 层 | 实现 | 作用 |
|---|---|---|
| 背景模糊 | `backdrop-blur-2xl` + `bg-white/60 dark:bg-zinc-900/60` | 射出背景光、透出内容 |
| 折射高光 | `::before` 顶部 1px 白→透明渐变 `from-white/40 to-transparent` | 玻璃上缘折射感 |
| 底部背光 | `shadow-[0_2px_20px_rgba(0,0,0,0.12)]` + 内侧 `inset 0 1px 0 rgba(255,255,255,0.3)` | 悬浮背光，浮起感 |

> 关键在 `backdrop-blur` + 半透明底 + 顶部高光渐变勾边 —— 三叠即是「液体玻璃」而不是普通毛玻璃。

**Tab 切换（Liquid Glass 液体滑动）**：
- **指示条**：每 tab 内嵌一个**绝对定位**的胶囊高亮（`bg-accent/15` 或 `bg-white/70` + `backdrop`），通过 `transform: translateX(100%)` 在 tab 之间滑动。
- **触发**：`onClick` 更新激活 index → 指示条用 spring 动画（`transition: transform 250ms spring`）滑动到新位置 —— 视觉上是「一个玻璃泡在胶囊条内滑过」，即 iOS 液体切换观感。
- **激活 tab**：icon + 文字转 `accent`，字体 600；未激活 `text-faint`。
- **焦点**：每个 tab `44×44px` 触控目标 + `focus-visible ring`；`aria-current="page"` 标记当前页。
- **实现注意**：指示条动画首选 **Framer Motion `layoutId`**（让激活态「流动」而非骤变），若不用库则用 CSS `transition` on `translateX` 也成立。

**可用 tab 集合**（首页/标签/关于，随路由扩展）：
| Tab | 图标(SVG) | 路由 |
|---|---|---|
| 首页 | Home | `/` |
| 标签 | Tag | `/tags` |
| 关于 | User | `/about` |

**可访问性**：胶囊条整体 `role="tablist"` 可选较弱（博客导航用普通导航更合适）；键盘可顺序 Tab 遍历、`Esc` 不适用（无面板）、指示条滑动是**装饰性** motion。

**reduced-motion**：禁止滑动动画，指示条直接瞬时切换位置（`transition: none`），玻璃材質保留。

### 3.2 文章卡片（ArticleCard）

列表页/首页的核心组件：

```
┌──────────────────────────────────────┐
│ ┈┈┈┈ gradient hairline ┈┈┈┈┈┈┈┈┈┈┈┈ │  ← 顶部分隔光带
│  [Tag 标签]                      →    │  ← 标签可点击；hover 浮现 →
│  ▲ 标题（link，hover 变 accent）       │
│  摘要 2 行截断…                        │
│  📅 2026-09-19 · 8 min read          │  ← text-faint
└──────────────────────────────────────┘
```

**Neo-Glow 辉光玻璃卡**（列表页/首页核心组件）：

| 状态 | 视觉规范 |
|---|---|
| **默认** | 玻璃拟态：`bg-surface/70 backdrop-blur-md` + 1px 半透明边框（亮 `#E4E4E7/60`，暗 `#27272A/60`）；`rounded-lg`；顶部分隔 **gradient hairline**：`bg-gradient-to-r from-accent/0 via-accent/70 to-accent/0` 高 1px，流动发光带 |
| **hover（桌面）** | ① 上浮 `-translate-y-0.5` + `glow-sm` 辉光；② **conic-gradient 光晕扫过**边框（`::before`，透明→accent 渐变，沿逆时针旋转 500ms）；③ 标题与标签转 `accent`；④ `→` 箭头从右侧淡入 |
| **active（按压）** | `translate-y-0`，辉光收敛，反馈 100ms |
| **移动端（无 hover）** | 保留玻璃态 + hairline + 静态辉光；无光晕动画，仅保留点击按压反馈 |
| **focus-visible** | `ring-2 ring-accent ring-offset-2`，不闪烁 |

| 属性 | 规范 |
|---|---|
| 标题 | `text-lg` 600，hover 变 `accent`，整卡可点击（标题 `<a>` + 卡片 `::after` 覆盖层，命中区 ≥ 44px） |
| 摘要 | `text-base` `text-muted`，`line-clamp-2` |
| 元信息 | `text-sm text-faint`；`<time dateTime>`（用当前系统时间计算「X min read」）+ 标签在前 |
| 标签 | `font-mono text-xs`，`rounded-full border border-zinc/30`，hover border→`accent` |
| 列表容器 | 单列全宽 `space-y-6`；**桌面 `lg:grid-cols-2` 双列瀑布**（内容增多时可选） |
| 记忆点 | 同一列表内 **仅第一张卡** hairline 加粗 + 辉光最强，形成「置顶文章」视觉节奏，其余卡次之 |

> **炫技边界**：辉光只属于卡片。正文/Kopfzeile 绝不同时发光，避免眩光疲劳。所有 motion 挂 `prefers-reduced-motion` gate（见 §5）。

### 3.3 文章页排版（Article Prose）

技术笔记的重中之重。

**正文规则**：
- 宽度 `max-w-[68ch]` 居中；段间距 `mt-6`；
- `p` 字号 `text-base`(16px)，行高 `1.75`，`text` 色；
- `h2` 上方留白 `mt-12` + 1px 上边框分隔；`h3` `mt-8`；标题一律带锚点 `id`，hover 显示 `#` 角标。

**链接**：`accent` 色 + 下划线（瑞士风保留下划线，便于识别），hover 变 `accent-hover`。为避免正文链接与普通文字混用下划线风格，正文链接统一 `border-bottom: 1px currentColor` + `underline-offset-2`。

**代码**：
| 元素 | 规范 |
|---|---|
| 行内代码 `` `code` `` | `font-mono text-sm`，`bg-zinc-100 dark:bg-zinc-800`，`rounded px-1.5 py-0.5`，border 1px |
| 代码块 `<pre>` | `bg-[#0A0A0A]`（不随主题变），`text-zinc-100`，`font-mono text-sm`，行高 1.7，`rounded-lg`，`overflow-x-auto` |
| 代码块头部 | 显示文件名/语言（`text-xs text-zinc-400`，border-bottom 1px `#27272A`）+ 复制按钮（44px 触控） |
| 代码高亮 | 仅用 accent 系高亮，色板源自对应主题的 palette；`selection` 高亮用 `accent` |
| 横向滚动 | 移动端长行 `overflow-x-auto`，避免撑破版面 |

**引用块**：`border-l-2 border-accent` + `pl-4`，`text-muted`，保留 1.5 倍气泡间距。

**表格**：`text-sm`，表头 600 字重 + `border-b border-border`，行分隔 `border-border` 1px，移动端允许 `overflow-x-auto`，表头做粘性（可选）。**不为表格叠加 zebra**（瑞士风克制）。

**图片/视频**：`rounded-md` + 1px `border`，`<figcaption>` `text-sm text-faint`；移动端图片全宽、`loading="lazy"`。

**标题锚点目录（TOC）**：
- 桌面（≥ lg）：右侧 sticky 目录，`w-56`，隐藏（`.toc-hidden`）。
- 移动端：不展示侧栏目录，改为文首折叠「目录」按钮（`aria-expanded`），或直接省略。
- TOC 条目：`text-sm`、两级缩进；激活条目用 `accent` + 左侧 2px 条。

### 3.4 标签（Tag）

- 样式：`font-mono text-xs` 字号，`bg-transparent`，1px `border-border`，`rounded-full px-2.5 py-1`；hover 时 border 变 `accent` / 文字变 `accent`。
- 卡片上的标签放在元信息行首；标签即可点击链接（`/tags/{slug}`），需满足 44px 触控区（padding 内加法）。

### 3.5 按钮（Button）

| 变体 | 样式 | 用途 |
|---|---|---|
| Primary | `bg-text text-bg`（亮色下黑底白字，**瑞士风用反色而非彩色**） | 「订阅」「提交」 |
| Secondary | `border border-border bg-surface` | 次要操作 |
| Ghost | `text-muted hover:text-text` | 图标按钮、复制、返回顶部 |
| Link | `text-accent underline` | 阅读全文 |

- 尺寸：`h-10 px-4 text-sm`（默认），小号 `h-8 px-3 text-sm`；触控目标 ≥ 44px。
- 状态：default / hover / active(:active 按压 translate-y-px) / focus / disabled（`opacity-50 cursor-not-allowed`）。

### 3.6 分页（Pagination）

纯链接列表（No JS），两侧为「上一页/下一页」，中间 `1 2 … 5`，当前页 `bg-text text-bg` 高亮，移动端只显示相邻页码 + 省略号，TOC 长度受控。

### 3.7 面包屑（Breadcrumb，可选）

`Home / 标签 / 某标签`，`text-sm text-faint`，链接 hover 变 `accent`，页面标题在前缀用 `<span aria-current="page">`。

### 3.8 状态组件

| 状态 | 移动端 | 桌面 |
|---|---|---|
| 文章加载 | 骨架屏：标题条 / 摘要条 / 图片块三个灰块（`animate-pulse`），**有 `aria-busy`** | 同左 |
| 列表空状态 | 居中文案「暂无文章」，`text-muted` | 同左 |
| 搜索无结果 | 居中「未找到 “XXX”，换个词试试」，附搜索框返回 | 同左 |
| 404 | 大号 `text-4xl` 位数字 + 说明 + 返回首页按钮 | 同左 |
| 网络错误 | 内联错误条：`bg-error/5 border border-error text-error` + 重试按钮 | 同左 |

> 所有异步按钮/表单：loading 时禁用并显示 spinner（`animate-spin`，加 `role="status"`）。

### 3.9 返回顶部（BackToTop，移动端）

- 右下角悬浮圆钮，`size-10 rounded-full bg-text text-bg shadow-md`；
- 滚动超过 1 屏出现（`opacity-0 pointer-events-none` → `opacity-100`，300ms）；
- **定位避让**：`right-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))]`，悬浮在 Liquid Glass Tab 条之上不重叠（见 §4）；
- 不打断阅读：只在移动端显示，桌面用 PageUp 或省略。

---

## 4. 移动端适配规则

| 规则 | 规范 |
|---|---|
| 触控目标 | 所有可点元素 ≥ 44×44px（链接文字用 padding 增加命中区） |
| 视口安全 | Liquid Glass Tab 用 `bottom: max(0.75rem, env(safe-area-inset-bottom))` 吸底；BackToTop 上移避开 Tab（`bottom: calc(5.5rem + env(safe-area-inset-bottom))`） |
| 底部遮挡 | 主内容容器加 `pb-28 lg:pb-8`，防止被悬浮 Tab 条盖住末行 |
| 字体建议 | 正文 375px 以下用 15px，**不低于 14px** |
| 正文宽度 | 内边距 20px，代码块超宽横向滚动而非压缩 |
| 表格 | 自动 `overflow-x-auto` 包裹 |
| 图片 | 全宽 + 自动高度，加载用 `blur-up` 或无晃动占位 |
| 悬停无效 | 移动端无 hover —— hover 效果仅作为增强，核心操作不依赖 hover 发现 |
| 暗色 | 跟随系统，不设本地开关（见 §6 检测方案） |
| 性能 | 组件 mount 延迟 > 300ms 显示骨架；图片懒加载；字体 preload |

---

## 5. 可访问性与键盘

- **Focus**：所有可交互元素 `focus-visible:ring-2 ring-accent ring-offset-2`（3–4px 可见环），**默认隐藏 outline，仅键盘显示 ring**。
- **跳转链接**：body 首元素 `Skip to content`（`sr-only focus:not-sr-only`）。
- 语义：Header→`<header>`，导航→`<nav aria-label="主导航">`，主内容→`<main id="main">`，文章→`<article>` / `time[dateTime]`，TOC→`<nav aria-label="文章目录">`，标签列表→`<ul>`。
- 键盘导航：TOC、菜单、分页全部可 Tab 遍历；`Esc` 关闭面板。
- **Liquid Glass Tab**：指示条滑动是装饰性 motion；激活态用 `aria-current="page"`（不依赖颜色），`role="navigation"`，键盘顺序遍历。
- 颜色非唯一信号：激活态必须同时有形状/字重/下划线变化。
- `prefers-reduced-motion` 时 `* { transition-duration: 0.01ms !important; animation: none }`。

---

## 6. 暗色模式检测（跟随系统主题）

### 6.1 检测策略

| 层 | 方式 | 用途 |
|---|---|---|
| **纯 CSS** | `@media (prefers-color-scheme: dark)` 覆盖 token（2.1） | 覆盖 100% UI，无 JS 依赖、零闪烁 |
| **React Hook** | `useSyncExternalStore` + `matchMedia`（见 6.2） | 仅当组件需要知道主题值做**额外渲染**时 |
| **HTML/元数据** | `<meta name="color-scheme" content="light dark">` + `<html>` 挂 `dark` class（可选） | 表单控件/滚动条原生适配 |

**两条铁律**：
1. 样式默认走 CSS token，Hook 是**补充**而非主路径——避免 DDOS by reflow。
2. **不做**本地切换按钮，完全以系统设置为准（你已确认）。

### 6.2 React Hook 实现（供少数需要主题值的组件）

```ts
// lib/use-system-theme.ts
"use client"; // 需要 matchMedia，仅客户端

import { useSyncExternalStore } from "react";

const MQ = "(prefers-color-scheme: dark)";

function subscribe(callback: () => void) {
  const mql = window.matchMedia(MQ);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

// SSR 阶段拿不到 window，返回保守值 'light'，hydrate 后自纠正
export function useSystemTheme(): "light" | "dark" {
  const isDark = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MQ).matches,
    () => false
  );
  return isDark ? "dark" : "light";
}
```

> 之所以用 `useSyncExternalStore` 而非 `useEffect + useState`：它保证 hydration 后**立即**与实际系统主题一致，避免「先亮后闪暗」的 FOUC。实际使用中**极少数组件**需要它（如代码主题跟随、Canvas 绘制）；纯 CSS 能表达的就别用 JS。

### 6.3 代码块如何跟随

代码高亮的**背景/边框/文件头**由 CSS token 分组（`pre` 用 `dark` 配色组）；只有当高亮库（如 Shiki/Prism）需按主题换色板时，才用 `useSystemTheme()` 选择色板对象，并在 `matchMedia` 变化时重新渲染。

---

## 7. 页面清单与路由

| 路由 | 页面 | 核心组件 |
|---|---|---|
| `/` | 首页 | Header · Hero(可选) · ArticleCard 列表 · Pagination |
| `/blog`（备用列表） | 文章列表 | 同上 |
| `/blog/[slug]` | 文章详情 | Article Prose · TOC · Tags · Prev/Next · BackToTop |
| `/tags` | 全部标签（云） | Tag 组件流式排列 |
| `/tags/[tag]` | 标签筛选列表 | Tag + ArticleCard 列表 |
| `/about` | 关于 | 简单富文本页（复用 Prose） |
| `/404` | 未找到 | 404 状态组件 |

> 首页即文章列表（不搞首屏 Hero 空转），技术博客读者要的是「马上读到内容」。

---

## 8. 落地清单（按优先级）

**P0（核心，一次完成）**
- [ ] `globals.css`：token 变量（2.1）双主题 + Liquid Glass token（2.7）+ `@media (prefers-color-scheme: dark)`
- [ ] `components/Navigate.tsx` 重构为桌面 Header（sticky + 主题感知）
- [ ] `components/TabBar.tsx`（Liquid Glass 胶囊导航：玻璃材质 3 层 + 液体滑动指示条）
- [ ] `components/ArticleCard.tsx`（Neo-Glow 辉光玻璃卡）
- [ ] `components/Footer.tsx`
- [ ] `app/page.tsx` 首页卡片列表化
- [ ] `lib/use-system-theme.ts`（6.2 Hook）
- [ ] 路由：`/tags`、`/about` 接入 TabBar

**P1（内容体验）**
- [ ] `components/prose` 样式（代码块、表格、引用、目录）
- [ ] `components/Tag.tsx`
- [ ] `components/Pagination.tsx`
- [ ] `components/BackToTop.tsx`

**P1b（导航增强）**
- [ ] Framer Motion 版本：指示条用 `layoutId` 做「流动」而非 CSS translate
- [ ] Tab 图标 + 文字双状态动效（active 位移 ±2px + 颜色）
- [ ] `prefers-reduced-motion` 下 Tab 无滑动、直接切换

**P2（增强）**
- [ ] 骨架屏 / 空状态 / 404
- [ ] TOC sticky 侧栏（desktop only）
- [ ] 双列瀑布（`lg:grid-cols-2`）+ 置顶卡加粗 hairline
- [ ] 代码高亮按系统主题换色板（用 6.2 Hook）

**验收标准（DoD）**
1. 375px 无横向溢出，正文 ≥ 15px，可点元素 ≥ 44px
2. 键盘可完整操作（Tab / Esc 关闭）
3. Focus ring 可见、对比度全项过 AA
4. `prefers-color-scheme: dark` 下所有页面 token 正确切换，卡片辉光/高亮同步
5. `prefers-reduced-motion` 下无动画（辉光/光晕/Tab 滑动禁用）
6. 系统主题变化时页面即时跟随，且无「先亮后暗」闪烁
7. Liquid Glass Tab：safe-area 吸底正确、无 Home 栏遮挡、BackToTop 不重叠
8. 移动端 Tab 激活项 `aria-current="page"` 正确，键盘可遍历