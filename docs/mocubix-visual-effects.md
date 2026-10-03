# Mocubix 视觉效果实现解析与复现指南

> 解析 [mocubix.renocrypt.com](https://mocubix.renocrypt.com/)（源码 [renocrypt/mocubix](https://github.com/renocrypt/mocubix)，Apache 2.0）的视觉效果实现方式，并给出在本项目（Next.js 16 + Tailwind CSS 4）中的复现路径。

---

## 1. Mocubix 是什么

一个纯 HTML/CSS 的滚动交互设计展览馆：**7 个展品 + 41 个命名效果的词典（Lexicon）**。零框架、零依赖、零动画库——README 的原话是 "what Chrome does natively is the exhibit"：Chrome 原生能力本身就是展品。

设计哲学（摘自其 AGENTS.md "法则"）：

- **演示，永不描述**——能滚动、能感受的才算交付物。
- **动效即内容**——只动画 `transform`、`opacity` 和绘制类属性，绝不触发重排，绝不阻塞输入。
- **DOM 拥有语义**——所有文字都是真实 DOM 文本，无 JS 的爬虫也能读全站（SEO/GEO 与渲染层分离）。
- **刻意只支持 Chrome**——这是它的产品决策，不是缺陷；复现到生产站点时需要渐进增强（见第 5 章）。

### 仓库结构

```
mocubix/
├── site/                  ← 发布的全部内容（GitHub Pages 直接部署）
│   ├── house.css          ← 共享 token（日夜双调色板）+ 页面 chrome
│   ├── house.js           ← 主题切换 + 源码链接标记
│   ├── annie-g/           ← 01 滚动驱动逐帧动画（Muybridge 的马）
│   ├── night-side/        ← 02 横向视差（空间站夜航）
│   ├── florence/          ← 03 速度响应（飓风，唯一重 JS 的展品）
│   ├── urformen/          ← 04 多时钟异步显影（Blossfeldt 植物）
│   ├── departures/        ← 05 翻牌显示器（split-flap 自定义元素）
│   ├── orrery/            ← 06 太阳系仪（实时天文）
│   ├── kilauea/           ← 07 四阶段状态切换（火山喷发）
│   ├── lexicon/           ← 41 效果词典（build 脚本生成）
│   └── parts/             ← 可复用自定义元素（一文件一元素）
├── build/                 ← Python 构建脚本（词典生成、LQIP、调色板、拼图）
└── notes/                 ← 决策日志、陷阱清单
```

### 本地运行

```bash
git clone https://github.com/renocrypt/mocubix
cd mocubix
python3 build/serve.py     # → http://127.0.0.1:8765/
```

每个页面右上角都有 Source 链接指向自己的源码文件夹——**任何页面都可以直接当模板复制**（这是官方设计意图，代码 Apache 2.0；图片来自 Wikimedia Commons 各自保留许可）。

---

## 2. 六大核心机制

Mocubix 全部视觉效果归结为 6 个技术。前 5 个来自展品源码，第 6 个来自 `house.css`。

### 2.1 runway/stage 钉住模式（一切的地基）

**对应词典：03 Pinning & Scrub**

"钉住 + 擦洗"：页面在滚，但舞台钉在视口不动，滚动条位置直接映射为动画进度。倒着滚，动画倒着放。

```css
/* 摘自 site/annie-g/index.html */
.runway {
  --pin: 6400px;                          /* "跑道"长度 */
  height: calc(100svh + var(--pin));
  view-timeline: --run block;             /* 滚动距离 → 时间线 */
}
.stage {
  position: sticky; top: 0;               /* 舞台钉在视口 */
  height: 100svh;
  overflow: clip;
}
```

```
滚动条:  0 ─────────────── 6400px ───────────>
         ┌────────────────────────────────┐
         │   sticky stage（钉住不动）        │  ← 用户始终看到的画面
         └────────────────────────────────┘
              │
              └── view-timeline --run: 0% ──> 100%
                  滚动进度 = 动画进度（可逆）
```

关键 API：

| API | 作用 |
|---|---|
| `view-timeline: --run block` | 在滚动容器上声明命名时间线 |
| `animation-timeline: --run` | 把某条动画挂到该时间线（替代默认的时钟） |
| `animation-range: contain 14% contain 92%` | 动画只在时间线的 14%–92% 区间播放 |

### 2.2 animation-range 编排（一场演出，各元素分时上下场）

一个时间线，多个读者，各自在自己的百分比区间演出。这是 Mocubix 编排思想的核心——**不是一条动画，而是按滚动进度指挥的舞台剧**：

```css
/* 摘自 site/annie-g/index.html —— 开场到奔跑的转场编排 */
.label { animation: out linear both;    animation-range: contain 0%  contain 7%;  } /* 标签 7% 前退场 */
.plate { animation: settle linear both; animation-range: contain 0%  contain 14%; } /* 图版 14% 前缩到位 */
.run   { animation: in linear both;    animation-range: contain 8%  contain 14%; } /* 放映区 8–14% 进场 */
.proj  { animation: frames steps(1);   animation-range: contain 14% contain 92%; } /* 帧 14–92% 步进 */
```

`both`（fill forwards + backwards）保证区间外状态冻结在起止值，区间之间可以重叠（8–14% 的进场叠在 0–14% 的图版缩放之上）。

### 2.3 `@property` 类型化自定义属性（一个信号，多个读者）

最精妙的一手：把整数注册为**可动画的类型化自定义属性**，让 CSS 变量成为广播总线。

```css
/* 摘自 site/annie-g/index.html */
@property --i { syntax: '<integer>'; inherits: true; initial-value: 0 }

/* 滚动驱动 --i 从 0 步进到 15（16 帧） */
.stage {
  animation: idx steps(16, jump-none) both;
  animation-timeline: --run;
  animation-range: contain 14% contain 92%;
}
@keyframes idx { from { --i: 0 } to { --i: 15 } }
```

一个 `--i` 同时喂三个读者，**零 JS**：

```
                     ┌──> 帧计数器（纯 CSS 计数器渲染数字）:
                     │     counter-reset: fr calc(var(--i) + 1);
                     │     content: counter(fr, decimal-leading-zero)      ← "07 / 16"
       --i (0..15)   ├──> 步态标签高亮（区间比较转透明度）:
                     │     opacity: clamp(0, 1 - max(var(--a) - var(--i),
                     │                    var(--i) - var(--b)), 1)
                     └──> 图版取景框 .gate 的 left/top/width/height 同步步进
```

Florence 展品用同一模式驱动三阶段字幕：`@property --ph` + `steps(3, jump-none)`，字幕堆叠用 `--k` 区间比较决定谁可见。

### 2.4 steps() + background-position 精灵图逐帧动画

16 帧马的照片是**一张图**（Muybridge 原版图版），用 `background-size` + `background-position` + `clip-path` 在 6.25%（100/16）的时间线间隔处切换：

```css
/* 摘自 site/annie-g/index.html（节选 3 帧，实际共 16 档） */
@keyframes frames {
  0%    { background-size: 402.778% 441.071%; background-position: 1.732%  3.054%;
          clip-path: inset(0 5.179% 0 0) }
  6.25% { background-size: 402.778% 441.071%; background-position: 33.118% 3.054%;
          clip-path: inset(0 1.613% 0 0) }
  12.5% { background-size: 402.778% 441.071%; background-position: 65.682% 3.054%;
          clip-path: inset(0 1.194% 0 0) }
  /* ... 每档是实测的取景框，原版上各帧宽度并不相同 */
}
```

注意那些数字不是拍脑袋——是逐帧实测的取景框（其 AGENTS.md："Measure; never eyeball"）。复现时需要为自己的素材做同样的测量，或用脚本生成。

### 2.5 速度响应（唯一重 JS 的机制）

**对应词典：07 Scroll Velocity Skew**

位置和速度是两个独立信号：位置走 CSS 时间线（机制 2.1），速度走 JS。Florence 展品把滚动速度读成"风速"驱动飓风仪表盘和风暴眼旋转：

```js
/* 摘自 site/florence/index.html */
const ATTACK = 40, RELEASE = 480;   // 时间常数（毫秒）：快攻慢放
let y = scrollY, t = performance.now(), v = 0;

function frame(now) {
  const dt = Math.max(1, now - t), ny = scrollY, jump = Math.abs(ny - y);
  // 一帧内跳超过一屏 = 瞬移（按键/锚链接），不算甩动
  const target = jump > innerHeight ? v : Math.min(MAX, jump / dt * 1000);
  y = ny; t = now;
  // 非对称指数平滑：快攻让猛甩立刻读数，慢放滤掉触控板抖动
  v += (target - v) * (1 - Math.exp(-dt / (target > v ? ATTACK : RELEASE)));
  if (v < 2) v = 0;
  // v 驱动：仪表盘指针（--kt）、类别标签、风暴眼旋转角度（--a）
}
addEventListener('scroll', () => { /* rAF 节流启动 */ }, { passive: true });
```

两个值得偷的细节：

- **快攻慢放**（40ms/480ms）：对称平滑要么滞后手势、要么把触控板抖动直接透传；非对称才对。
- **旋转层几何**：风暴眼旋转层是 `width: hypot(100vw, 100svh)` 的正方形——以屏幕对角线为边长，怎么转都露不出边。

### 2.6 token 系统 + `data-material` + view transition

**对应词典：37 Token Interpolation**

`house.css` 的设计系统，三个部分：

**a) 日夜双调色板**——同一组色相，两套明度。页面永远消费 token，从不自写颜色：

```css
/* 摘自 site/house.css（节选） */
:root, [data-material] {
  --ground: #0B0A09;  --raise: #131110;  --lift: #1A1715;   /* 夜 */
  --ink: #F2EDE5;     --mid: #B4ABA0;     --dim: #7E766D;
  --accent: #D4673F;  --indigo: #6E86B8;  /* terra 标活跃，indigo 专用于实测数值 */
  --line: color-mix(in srgb, var(--ink) 13%, transparent);  /* 派生色一律 color-mix */
}
:root[data-theme="day"] {
  --ground: #F4F0E9;  --raise: #ECE7DF;   --lift: #E5DFD6;   /* 昼：同色相重设为纸面 */
  --ink: #1D1814;     --mid: #585149;     --dim: #7C756C;
  --accent: #BA4E24;  --indigo: #49649F;
}
```

**b) `data-material` 墨随面走**——照片、夜空这类"素材"自带光影，不跟随调色板。标记 `[data-material]` 的元素在两套主题下都保持夜间 token，叠在它上面的文字永远可读：

```css
[data-material] { color: var(--ink) }  /* 素材上的墨色重启为夜墨 */
```

**c) 主题切换 = 一次 view transition**——整页交叉淡入淡出，用"宅曲线"缓动：

```css
/* 摘自 site/house.css */
:root { --settle: cubic-bezier(.16, .84, .24, 1); }  /* 快出发，长安静的到达 */

::view-transition-old(root), ::view-transition-new(root) {
  animation-duration: .55s;
  animation-timing-function: var(--settle);
}
```

---

## 3. 精选效果清单（按 leto 取舍）

Lexicon 全部 41 个效果见 <https://mocubix.renocrypt.com/lexicon/>（每个词条页有实跑演示 + 从业者实际使用的名称 + 产出它的 API 行）。以下按本项目（内容站 + 交易区）过滤出 10 个：

| 词典 # | 效果 | 核心 API | 复现成本 | leto 落点 |
|---|---|---|---|---|
| 36 | Marquee | `animation: scroll linear infinite` + 内容复制两份 | 低 | **已存在** `components/Marquee.tsx`，可对照词典页校准 |
| 25 | Blur-up (LQIP) | 16px WebP 占位 + `filter: blur()` 淡出 | 低 | blog 图片；Mocubix 有 `build/lqip.py` 配方（约 200 字节占位图） |
| 26 | Ken Burns | `animation: scale/translate linear` + `animation-timeline: view()` | 低 | 文章头图，滚动经过时缓慢推近 |
| 13 | Scroll-Triggered Count | `@property --n` + `steps()` + `counter()` | 低 | 统计位数字滚动到位（机制 2.3 直接套用） |
| 06 | Sticky Stacking Cards | `position: sticky` + 逐层 `scale`/`brightness` | 中 | blog 列表卡片堆叠 |
| 04 | Parallax | `animation-timeline: view()` + `translate` 差速 | 中 | hero 区前景/背景差速 |
| 32 | Split Text Reveal | 按词/字拆 `<span>` + `animation-range` 逐个入场 | 中 | 大标题入场（注意保持 DOM 文本完整以利 SEO） |
| 07 | Scroll Velocity Skew | 机制 2.5 的 JS + `skewX()` | 中 | 长列表滚动的质感反馈 |
| 27 | Duotone | `filter: grayscale(1)` + `mix-blend-mode` 或 `background-blend-mode` | 低 | 缩略图统一色调 |
| 14 | Scroll Snap | `scroll-snap-type: x mandatory` + `scroll-snap-align` | 低 | 横滑内容带（交易区指标条） |

取舍原则：内容站优先"低成本高感知"（25/26/13/27），交易区优先不干扰数据阅读的横滑（14），动效重头（04/32/07）留给 hero 和营销页。

---

## 4. 在 Next.js 16 + Tailwind CSS 4 中复现

### 4.1 好消息：核心机制全是纯 CSS

机制 2.1–2.4、2.6 都是 CSS 原生能力，**与框架无关**，在 RSC（服务端组件）里直接可用，零 hydration 成本。只有机制 2.5（速度响应）需要客户端组件。

### 4.2 CSS 落点

`@keyframes`、`@property`、`animation-timeline` 是完整规则，Tailwind 任意属性语法（如 `[animation-timeline:--run]`）只能引用，表达不了声明。落点选择：

```
全局通用机制（token、@property、主题切换）  →  app/globals.css
页面级编排（某页的 runway/stage/keyframes）  →  CSS Module（*.module.css）
一次性小效果                                →  <style> 或 Tailwind 任意属性引用已有规则
```

Tailwind 4 的 `@theme` 与 `house.css` 的 token 模式同构，可直接映射：

```css
/* globals.css 里用 @theme 定义 leto 版的宅 token */
@theme {
  --color-ground: #0b0a09;
  --color-ink: #f2ede5;
  --color-accent: #d4673f;
  --ease-settle: cubic-bezier(0.16, 0.84, 0.24, 1);
}
```

`data-material` 模式原样可用：素材容器加属性，CSS 里 `[data-material]` 保持暗色 token。

### 4.3 `'use client'` 边界

| 机制 | 需要客户端 JS？ | 组件形态 |
|---|---|---|
| 2.1 runway/stage | 否 | RSC，纯 CSS |
| 2.2 animation-range 编排 | 否 | RSC，纯 CSS |
| 2.3 `@property` 广播 | 否 | RSC，纯 CSS |
| 2.4 精灵图逐帧 | 否 | RSC，纯 CSS |
| 2.5 速度响应 | **是** | `'use client'` + rAF + passive scroll 监听 |
| 2.6 主题切换 | 触发时才要 | 切换按钮是 client 组件；view transition 本身是 CSS |

### 4.4 渐进增强（Mocubix 刻意不做、生产站必须做）

Mocubix 明确只支持 Chrome（其 AGENTS.md 把它定为产品决策）。leto 是面向用户的交易/内容站，必须门控：

```css
/* 无 scroll-driven animation 支持时降级为静态呈现 */
@supports (animation-timeline: view()) {
  .hero { animation: kenburns linear both; animation-timeline: view(); }
}
/* 不支持的浏览器：.hero 保持静态，页面照常可读可滚 */
```

支持现状（2026-10，落地前以 caniuse 核对）：`animation-timeline` 在 Chrome/Edge 自 2023 年稳定，Firefox 已于 2025 年跟进，Safari 需核对当前版本；`@property`、`color-mix()`、`::view-transition` 三大主流浏览器均已稳定。

### 4.5 性能红线（照搬 Mocubix 的法则)

- 只动画 `transform`、`opacity`、`filter`、`clip-path`、CSS 自定义属性——**绝不动画会触发重排的属性**（width/height/top/left）。
- Mocubix 的 `.gate` 动画 left/top/width/height 是例外（低频步进、非连续插值），连续动画一律走 `translate`/`scale`。
- 大面积素材图给足 `srcset`/`sizes`，首屏图 `fetchpriority="high"`，其余 `loading="lazy"` 且**必须写死宽高比**（Chrome 会标记无尺寸的懒加载图）。
- 速度响应的 rAF 循环在 `v === 0` 时自动停转（Mocubix 原文写法），不空转耗电。

### 4.6 SEO 对齐

Mocubix 的 "DOM owns meaning" 原则与 RSC 天然契合：所有文字服务端渲染为真实 DOM。复现 Split Text Reveal（32）这类拆字效果时，注意让拆分发生在 CSS/渲染层（如 `text-wrap: balance` + 逐词 span 由服务端输出），保证爬虫读到完整文本。

---

## 5. 参考

- 展览首页：<https://mocubix.renocrypt.com/>
- 源码仓库：<https://github.com/renocrypt/mocubix>（Apache 2.0，任何页面可作模板）
- 词典（41 效果索引）：<https://mocubix.renocrypt.com/lexicon/>
- 机器可读全站目录：<https://mocubix.renocrypt.com/llms.txt>
- 本文代码摘录来源：
  - 机制 2.1–2.4：`site/annie-g/index.html`
  - 机制 2.5：`site/florence/index.html`
  - 机制 2.6：`site/house.css`
- 字体：Fontshare（Melodrama/Switzer/各展品客串字体）+ jsDelivr（Geist Mono）——Mocubix 刻意不用 Google Fonts 的理由见其 AGENTS.md "House identity" 一节。
